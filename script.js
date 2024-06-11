(function () {
  var CLASSES = {
    modal: {
      active: 'active',
      visibleContent: 'visible'
    }
  };
  var SELECTORS = {
    formContainer: '.helloflow-container',
    control: '.helloflow-control',
    modal: '.helloflow-modal',
    modalContent: '.helloflow-modal-content',
    modalClose: '[data-hf-modal="close"]',
    modalOpen: '[data-hf-modal="open"]'
  };
  var ATTRIBUTES = {
    embeddingType: 'data-type',
    formLink: 'data-form',
    controlText: 'data-text',
    modalOpen: 'data-hf-modal'
  };
  var TEMPLATES = {
    iframe:
      '<iframe frameborder="0" height="100%" src="${form}" width="100%" allow="camera; microphone; autoplay; encrypted-media;" title="helloflow-embed" style="border: 0;"></iframe>',
    control:
      '<div class="helloflow-control -${type}" data-hf-modal="open">${text}</div>',
    pageModal:
      '' +
      '<div class="helloflow-modal -${type}" data-hf-modal="close">' +
      '<div class="helloflow-modal-content">' +
      '<i class="helloflow-modal-close" data-hf-modal="close">Ã—</i>' +
      '</div>' +
      '</div>'
  };
  var MIXINS = {
    buildTemplate: function (str, data) {
      return str.replace(/\$\{([\w]+)\}/g, function (source, match) {
        if (data[match] || data[match] === 0) {
          return data[match];
        }
      });
    },
    createNodesFromTemplate: function (template) {
      var div = document.createElement('div');
      div.innerHTML = template;

      return div.childNodes;
    },
    appendTemplate: function (element, template) {
      var childNodes = MIXINS.createNodesFromTemplate(template);
      for (var i = 0; i < childNodes.length; i++) {
        element.appendChild(childNodes[i]);
      }
    },
    passiveClick: function (e) {
      e.preventDefault();
      e.stopPropagation();
    },
    closeAllModals: function () {
      var modals = document.querySelectorAll(SELECTORS.modal);
      modals.forEach(function (element) {
        MIXINS.closeModal(element, true);
      });
    },
    openModal: function (element) {
      MIXINS.closeAllModals();
      var content = element.querySelector(SELECTORS.modalContent);
      var control = element.nextSibling;

      element.classList.add(CLASSES.modal.active);
      setTimeout(function () {
        content.classList.add(CLASSES.modal.visibleContent);
        control.classList.add(CLASSES.modal.active);
      }, 25);
    },
    closeModal: function (element, fast) {
      var content = element.querySelector(SELECTORS.modalContent);
      var control = element.nextSibling;

      content.classList.remove(CLASSES.modal.visibleContent);
      control.classList.remove(CLASSES.modal.active);

      if (fast) {
        element.classList.remove(CLASSES.modal.active);
      } else {
        setTimeout(function () {
          element.classList.remove(CLASSES.modal.active);
        }, 300);
      }
    }
  };

  var forms = [];

  var HelloFlowForm = function (options) {
    this.formLink = options.formLink;
    this.embeddingType = options.embeddingType;
    this.controlText = options.controlText;
    this.container = options.container;
    this.control = null;
    this.modal = null;
    this.iframeTemplate = null;
    this.init();
  };

  HelloFlowForm.prototype = {
    init: function () {
      var iframeOptions = {
        form: this.formLink
      };
      this.iframeTemplate = MIXINS.buildTemplate(
        TEMPLATES.iframe,
        iframeOptions
      );

      if (this.embeddingType === 'standard') {
        MIXINS.appendTemplate(this.container, this.iframeTemplate);
      } else {
        this.initModal();
        var modalContent = this.modal.querySelector(SELECTORS.modalContent);
        MIXINS.appendTemplate(modalContent, this.iframeTemplate);
      }
    },
    initModal: function () {
      this.container.removeAttribute('style');
      var options = {
        type: this.embeddingType,
        text: this.controlText
      };
      var controlTemplate = MIXINS.buildTemplate(TEMPLATES.control, options);
      var modalTemplate = MIXINS.buildTemplate(TEMPLATES.pageModal, options);
      MIXINS.appendTemplate(this.container, modalTemplate);
      MIXINS.appendTemplate(this.container, controlTemplate);
      this.control = this.container.querySelector(SELECTORS.control);
      this.modal = this.container.querySelector(SELECTORS.modal);
      this.initModalEvents();
    },
    initModalEvents: function () {
      var self = this;

      var modalContent = this.modal.querySelector(SELECTORS.modalContent);
      modalContent.addEventListener('click', MIXINS.passiveClick);

      var closeButtons = this.container.querySelectorAll(SELECTORS.modalClose);
      var openButtons = this.container.querySelectorAll(SELECTORS.modalOpen);
      closeButtons.forEach(function (element) {
        element.addEventListener('click', function () {
          MIXINS.closeModal(self.modal);
        });
      });
      openButtons.forEach(function (element) {
        element.addEventListener('click', function () {
          var isActive = self.modal.classList.contains(CLASSES.modal.active);
          if (isActive) {
            MIXINS.closeModal(self.modal);
          } else {
            MIXINS.openModal(self.modal);
          }
        });
      });
    }
  };

  function createForms() {
    var embedContainers = document.querySelectorAll(SELECTORS.formContainer);
    embedContainers.forEach(function (element) {
      var options = {
        formLink: element.getAttribute(ATTRIBUTES.formLink),
        embeddingType: element.getAttribute(ATTRIBUTES.embeddingType),
        controlText: element.getAttribute(ATTRIBUTES.controlText),
        container: element
      };
      forms.push(new HelloFlowForm(options));
    });
  }

  function initialization() {
    if (window.NodeList && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = Array.prototype.forEach;
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createForms);
    } else {
      createForms();
    }
  }

  initialization();
  window.HelloFlowForms = forms;
})();