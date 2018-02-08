;;; flycheck-jslint.el --- Flycheck JSLint checker -*- lexical-binding: t; -*-

;;; Commentary:

;; Flycheck JSLint checker

;;; Code:

(require 'flycheck)

(flycheck-define-checker javascript-jslint
  "A JavaScript and JSON syntax and style checker using JSLint.

See URL `https://jslint.com/'."
  :command ("jslint-cli")
  :standard-input t
  :error-patterns ((error line-start line "," column " " (message) line-end))
  :modes (js-mode js2-mode json-mode))

(add-to-list 'flycheck-checkers 'javascript-jslint)

(provide 'flycheck-jslint)

;;; flycheck-jslint.el ends here
