// Script completo para automação de atividades Expansão SP
// Delay de 30-60s dentro das questões
// Delay de 20-30s entre exames

(function() {
    'use strict';

    console.clear();
    const noop = () => {};
    console.warn = console.error = window.debug = noop;

    function randomDelay(min, max) {
        return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
    }

    class UrlHelper {
        static extractUrlParam(url, paramName) {
            return new URL(url).searchParams.get(paramName);
        }

        static extractByRegex(text, regex) {
            const match = text.match(regex);
            return match?.[1];
        }

        static createUrl(baseUrl, path, params = {}) {
            const url = new URL(path, baseUrl);
            Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
            return url.toString();
        }
    }

    class RequestManager {
        constructor(baseUrl = 'https://expansao.educacao.sp.gov.br', maxRetries = 3) {
            this.baseUrl = baseUrl;
            this.maxRetries = maxRetries;
            this.defaultHeaders = {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
            };
        }

        async fetchWithRetry(url, options = {}, retries = this.maxRetries) {
            const fullUrl = url.startsWith('http') ? url : UrlHelper.createUrl(this.baseUrl, url);
            const response = await fetch(fullUrl, { credentials: 'include', headers: this.defaultHeaders, ...options });
            if (!response.ok && retries > 0) {
                const delay = Math.pow(2, this.maxRetries - retries) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.fetchWithRetry(url, options, retries - 1);
            }
            return response;
        }
    }

    class ExamAutomator {
        constructor() { this.requestManager = new RequestManager(); }

        async fetchExamPage(examUrl) {
            const response = await this.requestManager.fetchWithRetry(examUrl);
            const pageText = await response.text();
            const contextId = UrlHelper.extractUrlParam(examUrl, 'id') || UrlHelper.extractByRegex(pageText, /contextInstanceId":(\d+)/);
            const sessKey = UrlHelper.extractByRegex(pageText, /sesskey":"([^"]+)/);
            return { contextId, sessKey };
        }

        async startExamAttempt(contextId, sessKey) {
            const formData = new URLSearchParams({ cmid: contextId, sesskey: sessKey });
            const response = await this.requestManager.fetchWithRetry('/mod/quiz/startattempt.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString(),
                redirect: 'follow'
            });
            const redirectUrl = response.url;
            return { redirectUrl, attemptId: UrlHelper.extractByRegex(redirectUrl, /attempt=(\d+)/) };
        }

        async extractQuestionInfo(questionUrl) {
            const response = await this.requestManager.fetchWithRetry(questionUrl);
            const pageText = await response.text();
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(pageText, "text/html");
            const questionData = { questId: null, seqCheck: null, options: [], attempt: null, sesskey: null, formFields: {} };

            htmlDoc.querySelectorAll("input[type='hidden']").forEach(input => {
                const name = input.getAttribute("name");
                const value = input.getAttribute("value");
                if (!name) return;
                if (name.includes(":sequencecheck")) {
                    questionData.questId = name.split(":")[0];
                    questionData.seqCheck = value;
                } else if (name === "attempt") questionData.attempt = value;
                else if (name === "sesskey") questionData.sesskey = value;
                else if (["thispage", "nextpage", "timeup", "mdlscrollto", "slots"].includes(name)) questionData.formFields[name] = value;
            });

            htmlDoc.querySelectorAll("input[type='radio']").forEach(input => {
                const name = input.getAttribute("name");
                const value = input.getAttribute("value");
                if (name?.includes("_answer") && value !== "-1") questionData.options.push({ name, value });
            });

            return questionData;
        }

        async submitAnswer(questionData, contextId) {
            await randomDelay(30000, 60000); // 30 a 60s delay dentro da questão
            const selectedOption = questionData.options[Math.floor(Math.random() * questionData.options.length)];
            const formData = new FormData();
            formData.append(`${questionData.questId}:1_:flagged`, "0");
            formData.append(`${questionData.questId}:1_:sequencecheck`, questionData.seqCheck);
            formData.append(selectedOption.name, selectedOption.value);
            formData.append("next", "Finalizar tentativa ...");
            formData.append("attempt", questionData.attempt);
            formData.append("sesskey", questionData.sesskey);
            formData.append("slots", "1");
            Object.entries(questionData.formFields).forEach(([key, value]) => formData.append(key, value));

            const url = `/mod/quiz/processattempt.php?cmid=${contextId}`;
            const response = await this.requestManager.fetchWithRetry(url, { method: "POST", body: formData, redirect: "follow" });
            return { redirectUrl: response.url, attemptId: questionData.attempt, sesskey: questionData.sesskey };
        }

        async finishExamAttempt(attemptId, contextId, sesskey) {
            await this.requestManager.fetchWithRetry(`/mod/quiz/summary.php?attempt=${attemptId}&cmid=${contextId}`);
            const formData = new URLSearchParams({ attempt: attemptId, finishattempt: "1", timeup: "0", slots: "", cmid: contextId, sesskey });
            await this.requestManager.fetchWithRetry('/mod/quiz/processattempt.php', { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: formData.toString(), redirect: "follow" });
        }

        async completeExam(examUrl) {
            const { contextId, sessKey } = await this.fetchExamPage(examUrl);
            const { redirectUrl } = await this.startExamAttempt(contextId, sessKey);
            const questionData = await this.extractQuestionInfo(redirectUrl);
            const { attemptId, sesskey } = await this.submitAnswer(questionData, contextId);
            return this.finishExamAttempt(attemptId, contextId, sesskey);
        }
    }

    class PageCompletionService {
        constructor() { this.requestManager = new RequestManager(); }
        async markPageAsCompleted(pageId) { await this.requestManager.fetchWithRetry(`/mod/resource/view.php?id=${pageId}`); }
    }

    class ActivityProcessor {
        constructor() {
            this.examAutomator = new ExamAutomator();
            this.pageCompletionService = new PageCompletionService();
        }

        async processActivities() {
            const activities = Array.from(document.querySelectorAll("li.activity")).filter(activity => {
                const link = activity.querySelector("a.aalink");
                const completionButton = activity.querySelector(".completion-dropdown button");
                return link?.href && (!completionButton || !completionButton.classList.contains("btn-success"));
            });

            const simplePages = [];
            const exams = [];

            activities.forEach(activity => {
                const link = activity.querySelector("a.aalink");
                const url = new URL(link.href);
                const pageId = url.searchParams.get("id");
                const activityName = link.textContent.trim();
                if (pageId) {
                    if (/responda|pause/i.test(activityName)) exams.push({ href: link.href, nome: activityName });
                    else simplePages.push(pageId);
                }
            });

            for (const pageId of simplePages) await this.pageCompletionService.markPageAsCompleted(pageId);

            for (let i = 0; i < exams.length; i++) {
                await this.examAutomator.completeExam(exams[i].href);
                if (i < exams.length - 1) await randomDelay(20000, 30000); // delay entre exames
            }

            console.log("Todas as atividades processadas com sucesso!");
        }
    }

    // Inicializa o processamento
    window.addEventListener('load', () => {
        if (window.location.hostname === 'expansao.educacao.sp.gov.br') {
            const processor = new ActivityProcessor();
            setTimeout(() => processor.processActivities(), 1000);
        }
    });

})();
