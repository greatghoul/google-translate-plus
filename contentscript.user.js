// ==UserScript==
// @name         Google Translate Plus
// @namespace    https://github.com/greatghoul/google-translate-plus/
// @version      0.1
// @description  try to take over the world!
// @author       greatghoul
// @match        https://translate.google.com/
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  function find(sel) {
    return document.querySelector(sel);
  }

  function findAll(sel) {
    return document.querySelectorAll(sel);
  }

  function initStyle(style) {
    const styleElem = document.createElement('style');
    styleElem.innerHTML = style;
    document.querySelector('head').appendChild(styleElem);
  }

  function initTransSettingsBar() {
    const barElem = document.createElement('div');
    barElem.innerHTML = `
      <div id="gm-trans-container">
        <button type="button" id="gm-button-save"
           class="jfk-button jfk-button-standard">Save</button>
        <div id="gm-trans-list"></div>
      </div>
    `;

    document.querySelector('#gt-text-c').prepend(barElem);
    Object.keys(localStorage).forEach(k => {
      if (k.match(/GTP_SETTING_/)) {
        renderSetting(JSON.parse(localStorage[k]));
      }
    });
  }

  function applySetting(setting) {
    const data = getCurrentData();
    const text = encodeURIComponent(data[setting.srcLang] || data.auto || '');
    window.location.hash = `#${setting.srcLang}/${setting.desLang}/${text}`;
  }

  function renderSetting(setting) {
    let elem = find('#' + setting.key);
    if (!elem) {
      elem = document.createElement('div');
      elem.id = setting.key;
      elem.className = 'jfk-button jfk-button-standard';

      const text = document.createElement('span');
      text.innerHTML = `${setting.srcText} -> ${setting.desText}`;
      text.addEventListener('click', () => applySetting(setting));
      elem.appendChild(text);

      const removeButton = document.createElement('a');
      removeButton.href = 'javascript:;';
      removeButton.innerHTML = '&times;';
      removeButton.style.marginLeft = '10px';
      removeButton.style.color = 'red';
      removeButton.addEventListener('click', () => removeSetting(setting));
      elem.appendChild(removeButton);

      find('#gm-trans-list').appendChild(elem);
    }
  }

  function getCurrentData() {
    const setting = getCurrentSetting();
    const data = {};
    data[setting.srcLang] = find('#source').value;
    data[setting.desLang] = find('#gt-res-content').innerText;
    data.auto = find('#source').value;
    return data;
  }

  function getCurrentSetting() {
    const srcElem = find('#gt-sl-sugg .sl-sugg-button-container .jfk-button-checked');
    const desElem = find('#gt-tl-sugg .sl-sugg-button-container .jfk-button-checked');
    const setting = {
      srcLang: srcElem.getAttribute('value'),
      srcText: srcElem.innerText,
      desLang: desElem.getAttribute('value'),
      desText: desElem.innerText,
    };
    setting.key = `GTP_SETTING_${setting.srcLang}_${setting.desLang}`;
    return setting;
  }

  function saveSetting() {
    const setting = getCurrentSetting();
    localStorage.setItem(setting.key, JSON.stringify(setting));
    renderSetting(setting);
  }

  function removeSetting(setting) {
    localStorage.removeItem(setting.key);
    find('#' + setting.key).remove();
  }

  function initEvents() {
    document.querySelector('#gm-button-save').addEventListener('click', saveSetting);
  }

  initStyle(`
    #gm-button-save {
      margin-left: 0;
      display: inline-block;
      min-width: 20px;
      cursor: pointer;
      line-height: unset;
    }

    #gm-trans-list {
      display: inline;
    }

    #gm-trans-container {
      padding-bottom: 10px;
      margin-bottom: 10px;
      border-bottom: 1px solid #e5e5e5
    }

    #gm-trans-container .jfk-button-standard {
      height: 30px;
      line-height: 27px;
      cursor: pointer;
      margin-right: 10px;
      display: inline-block;
    }
  `);

  initTransSettingsBar();
  initEvents();
})();
