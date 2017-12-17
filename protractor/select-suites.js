$(function() {
  var templates = {};
  $('script[type="text/x-handlebars"]').each(function (i, node) {
      templates[node.getAttribute('name')] = Handlebars.compile(node.innerHTML);
  });

  var Pattern = Backbone.Model.extend({
    clone: function() {
    }
  });
  var PatternList = Backbone.Collection.extend({
    model: Pattern,
    deletePattern: function(patternId) {
      var _this = this;
      var pattern = this.get(patternId);
      var delete_pattern_yes = confirm("Are you sure you want to delete pattern '"+pattern.attributes.friendly_name+"'?");
      if(!delete_pattern_yes) return;
      this.remove(pattern);
      function errorHandler(err) {
        if(err.message) err = err.message;
        alert(err);
        _this.add(pattern);
      }
      $.ajax({
        url: URLS['ajax_remove_pattern'].replace('--patternId--', patternId),
        type: 'GET'
      }).then(function(res) {
        res = JSON.parse(res);
        if(!res.success) {
          errorHandler(res.error);
        }
      }, errorHandler);
    }
  });
  var Favorite = Backbone.Model.extend({
    initialize: function() {
      this.setHeader();
      this.set('patterns', new PatternList(this.get('patterns')))
      this.listenTo(this, 'change:header', this.setHeader);
      this.setCanCreate();
      this.listenTo(this, 'change:canCreatePatterns', this.setCanCreate);
      this.listenTo(this.get('patterns'), 'add', this.setCanCreate);
      this.listenTo(this, 'change:patterns', this.setPatterns);
      var ev = ['show_landing_page', 'show_status', 'audit_fires'].map(function(attr) {
        return 'change:' + attr;
      }).join(' ');
      this.listenTo(this, ev, this.checkShowStatus);
    },
    setHeader: function() {
      var header = this.get('header');
      if(header) {
        var header = this.get('header');
        var targets = header.targets;
        if(_.isString(targets)) {
          try {
            targets = JSON.parse(targets);
          } catch (e) {
            targets = [];
          }
          header.targets = targets;
        }
        if (!_.isArray(targets)) {
          header.targets = targets = [];
        }
        var reportKey = window.reports.reduce(function(key, report) {
          return (report.get('suites') || []).reduce(function(key, suite) {
            var display_name = report.get('site_title') + ': ' + suite.relation_name;
            key[report.get('rsid') + ':' + suite.relation_id] = display_name;
            return key;
          }, key);
        }, {});
        header.targets.forEach(function(target) {
          target.display_name = reportKey[target.rsid + ':' + target.relation_id];
        });
        header.header_id = header.id;
        delete header.id;
        this.set(header);
      }
    },
    addTargets: function(toAdd) {
      var targets = this.get('targets');
      targets = targets || [];
      targets = targets.concat(toAdd.filter(function(target) {
        return !targets.filter(function(t) {
          return t.rsid === target.rsid && t.relation_id === target.relation_id;
        })[0];
      }));
      this.set('targets', targets);
      this.trigger('change:targets', targets);
    },
    removeTargets: function(indexes) {
      indexes = _.sortBy(indexes, function(n) { return n; });
      indexes.reverse().forEach(function(i) {
        this.get('targets').splice(i, 1);
      }, this);
      this.trigger('change:targets', this.get('targets'));
    },
    setCanCreate: function() {
      var canCreatePatterns = this.get('canCreatePatterns');
      this.get('patterns').forEach(function(pattern) {
        pattern.set('canCreatePatterns', canCreatePatterns);
      });
    },
    isLoading: function(ignoreCreating) {
      var header = this.get('header');
      return (!ignoreCreating && this.get('creating')) ||
        (!this.get('initialized') || this.get('refreshing'));
    },
    checkShowStatus: function() {
      var attrs = _.clone(this.attributes);
      var madeChange = false;
      if(!attrs.show_landing_page && attrs.show_status) {
        attrs.show_status = false;
        madeChange = true;
      }
      if(!attrs.show_status && attrs.audit_fires) {
        attrs.audit_fires = false;
        madeChange = true;
      }
      if(!attrs.audit_fires &&
        (attrs.audit_suite_receives_code || attrs.audit_report_receives_code)) {
          attrs.audit_suite_receives_code = false;
          attrs.audit_report_receives_code = false;
          madeChange = true;
      }
      if(madeChange) {
        this.set(attrs);
      }
    },
    refresh: function() {
      this.set('refreshing', true);
      $.ajax(URLS['ajax_refresh_favorite'], {
        data: {
          'favorite_id': this.id
        },
        dataType: 'json',
        type: 'POST'
      });
    },
    save: function() {
      var _this = this;
      var data = [
        'header_id', 'targets', 'show_landing_page',
        'tracking_parameter', 'show_status', 'audit_fires',
        'audit_suite_receives_code', 'audit_report_receives_code',
        'additional_parameters', 'autoccTo', 'tracking_parameter_type',
        'csv_date_selected'
      ].reduce(function(data, attr) {
        data[attr] = _this.get(attr);
        return data;
      }, {});
      return $.ajax(URLS['ajax_save_targets'], {
        data: data,
        dataType: 'json',
        type: 'POST'
      });
    }
  });
  var FavoriteList = Backbone.Collection.extend({
    model: Favorite,
    initialize: function() {
      this.listenTo(this, 'change:refreshing change:initialized add remove sync reset', this.setCheckInitialization);
      var _this = this;
      setTimeout(function() {
        _this.setCheckInitialization();
        _this.registerCheckInitialization();
      });
    },
    getFavorite: function(rsid, relation_id) {
      return this.find(function(favorite) {
        return favorite.get('rsid') === rsid && favorite.get('relation_id') === relation_id;
      });
    },
    addPattern: function(pattern) {
      var favorite = this.getFavorite(pattern.get('rsid'), pattern.get('relation_id'));
      if(favorite) {
        favorite.get('patterns').add(pattern);
      }
    },
    removeFavorite: function(favorite) {
      this.remove(favorite);
      $.ajax(URLS['ajax_remove_favorite'], {
        data: {
          id: favorite.id
        },
        dataType: 'json',
        type: 'POST'
      });
    },
    createFavorite: function(data) {
      var favorite = new Favorite({
        rsid: data.rsid,
        relation_id: data.relation_id,
        friendly_name: data.site_title + ' » ' + data.relation_name,
        creating: true
      });
      this.add(favorite);
      var _this = this;
      $.ajax(URLS['ajax_add_favorite'], {
        data: {
          rsid: data.rsid,
          relation_id: data.relation_id
        },
        dataType: 'json',
        type: 'POST'
      }).then(function(data) {
        if(data.error) {
          throw data.error;
        }
        delete favorite.attributes.creating;
        var patterns = data.patterns;
        delete data.patterns;
        favorite.set(data);
        favorite.get('patterns').add(patterns);
      }).then(null, function(error) {
        _this.remove(favorite);
      });
    },
    setCheckInitialization: function() {
      this.numLoading = this.filter(function(favorite) {
        return favorite.isLoading(true);
      }).length;
    },
    registerCheckInitialization: function() {
      this.timeout = setTimeout(this.checkInitialization.bind(this), 5000);
    },
    checkInitialization: function() {
      var _this = this;
      if(this.numLoading > 0) {
        $.ajax(URLS['ajax_check_favorites'], {
          data: '',
          dataType: 'json',
          type: 'GET',
          error: function (xhr, tstatus, error) {
              // show_error('Server error:', tstatus);
              return;
          },
          success: function(data, tstatus, xhr) {
            if(data) {
              data.initialized && data.initialized.forEach(_this.checkFavorite, _this);
              data.uninitialized && data.uninitialized.forEach(_this.checkFavorite, _this);
            }
            _this.registerCheckInitialization();
          }
        });
      } else {
        this.registerCheckInitialization();
      }
    },
    checkFavorite: function(fav) {
      var favorite = this.get(fav.id);
      if(favorite) {
        favorite
          .set('refreshing', fav.refreshing)
          .set('initialized', fav.initialized);
      }
    }
  });

  var Report = Backbone.Model.extend({
    refresh: function() {
      var _this = this;
      this.set('suites', []);
      return $.getJSON(URLS['get_one_suite'].replace('--rsid--', this.get('rsid')), function(json) {
        _this.set('suites', json);
      });
    }
  });

  var ReportList = Backbone.Collection.extend({
    model: Report,
    refresh: function() {
      this.reset();
      var _this = this;
      return $.getJSON(URLS['refresh_suite_list'], function (json) {
        _this.reset(json);
      });
    }
  });

  var RenderView = Backbone.View.extend({
    render: function() {
      var _this = this;
      this.beforeRender && this.beforeRender();
      this._children = this._children || {};
      var child;
      for(child in this._children) {
        this._children[child].undelegateEvents();
      }
      this.$el.html(templates[this.className](this.getViewContext()));
      this.$el.find('[data-child]').each(function() {
        var $this = $(this);
        var name = $this.data('name');
        var $child = null;
        if(!($child = _this._children[name])) {
          var view = _this[$this.data('child')]($this);

          view.setElement(this);

          _.forEach(_this.componentEvents, function(fnName, eventName) {
            // TODO: memory leak
            view.on(eventName, _this[fnName].bind(_this));
          });

          view.render();
          _this._children[name] = view;
        } else {
          this.innerHtml = '';
          if(!$child.el.innerHtml) {
            $child.render();
          }
          this.appendChild($child.el);
          $child.delegateEvents();
        }
      });
      this.afterRender && this.afterRender();
    },
    getViewContext: function() {
      return _.extend({}, this, this.model && this.model.attributes);
    },
    listenTo: function(obj, event, cb) {
      if(this.isDom(obj)) {
        var bindedCb = cb.bind(this);
        this._binded.push({
          cb: bindedCb,
          obj: obj,
          event: event
        });
        obj.on(event, bindedCb);
      } else {
        Backbone.View.prototype.listenTo.apply(this, arguments);
      }
    },
    stopListening: function(obj, event, cb) {
      if(this.isDom(obj)) {
        var handlers = _(this._binded);
        handlers = handlers.filter(function(info) {
          return info.obj === obj || (obj instanceof $ && obj.is(info.obj));
        });
        if(event) {
          handlers = handlers.filter(function(info) {
            return event === info.event;
          }, this);
          if(cb) {
            handlers = handlers.filter(function(info) {
              return cb === info.cb;
            }, this);
          }
        }
        handlers = handlers.value();
        handlers.forEach(this.turnOff);
        handlers.forEach(function(handler) {
          this._binded.splice(this._binded.indexOf(handler), 1);
        }, this);
      } else {
        this._binded.forEach(this.turnOff);
        this._binded = [];
        Backbone.View.prototype.stopListening.apply(this, arguments);
      }
    },
    turnOff: function(info) {
      info.obj.off(info.event, info.bindedCb);
    },
    isDom: function(obj) {
      return obj && (obj instanceof $ || this.isElement(obj));
    },
    isElement: function(obj) {
      try {
        //Using W3 DOM2 (works for FF, Opera and Chrom)
        return obj instanceof HTMLElement;
      }
      catch(e){
        //Browsers not supporting W3 DOM2 don't have HTMLElement and
        //an exception is thrown and we end up here. Testing some
        //properties that all elements have. (works on IE7)
        return (typeof obj==="object") &&
          (obj.nodeType===1) && (typeof obj.style === "object") &&
          (typeof obj.ownerDocument ==="object");
      }
    }
  });

  Object.defineProperty(RenderView.prototype, '_binded', {
    get: function() {
      this.__binded = this.__binded || [];
      return this.__binded;
    },
    set: function(val) {
      this.__binded = val;
    }
  });

  var SettingsModalView = RenderView.extend({
    className: 'settings-modal',
    initialize: function(options) {
      this.model = new Backbone.Model();
      this.model.set('group', 0);
      this.model.set('groups', [
        'General',
        'Multi-Target-Uploads',
        'Landing Page Settings'
      ].map(function(str) { return {str: str}; }));
      this.reportList = options.reportList;
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.reportList, 'change', this.render);
      this.listenTo($('body'), 'click', this.close);
    },
    remove: function() {
      $('body').off('click', this.bindedClose);
      Backbone.View.prototype.remove.apply(this, arguments);
    },
    events: {
      'click': 'stopPropagation',
      'click .add-target [target-rsid]': 'toggleDisplay',
      'click [data-select]': 'selectTarget',
      'change [csv_date_selector]': 'getSelectedDate',
      'click [data-action]': 'runAction',
      'change [data-sync]': 'syncVariable',
      'change [data-additional-parameter]': 'syncParameter',
      'change [data-autocc]': 'changeAutoCC',
      'change [data-autocc-to]': 'changeAutoCCTo',
      'click [group-id]': 'changeGroup',
      'click input[type="checkbox"].check-target': 'checkTarget',
      'click a[data-suite-relation-id]': 'checkTarget'
    },
    getSelectedDate: function(e) {
      date_selected = $('#csv_date_id').datepicker().val();
      this.favorite.set('csv_date_selected', date_selected);
    },
    removeParameter: function(e) {
      e.preventDefault();
      var parameters = this.favorite.get('additional_parameters');
      if(parameters) {
        parameters = _.clone(parameters, true);
        var index = $(e.target).closest('[data-index]').data('index');
        if(_.isNumber(index)) {
          parameters.splice(index, 1);
          this.favorite.set('additional_parameters', parameters);
        }
      }
    },
    addParameter: function(e) {
      e.preventDefault();
      var parameters = this.favorite.get('additional_parameters');
      if(!parameters) {
        parameters = [];
      } else {
        parameters = _.clone(parameters, true);
      }
      parameters.push({
        parameter: '',
        column: this.favorite.get('headers')[0],
        value: ''
      });
      this.favorite.set('additional_parameters', parameters);
    },
    changeAutoCC: function(e) {
      if($(e.target).is(':checked')) {
        this.favorite.set('autoccTo', '');
      } else {
        this.favorite.unset('autoccTo');
      }
    },
    changeAutoCCTo: function(e) {
      var $emailList = "";
      var $delimiterChar = ";";
      var $allEmailsValid = true;

      //Change any delimiters (comma or space) entered to a semi-colon for easy parsing 
      //and cleaner storing and use.
      $emailList = $(e.target).val().replace(/,/g, ";");
      $emailList = $emailList.replace(/ /g, ";");
      
      var arrayOfEmails = $emailList.split($delimiterChar);
      for (i = 0; i < arrayOfEmails.length; i++) {
        if( !singleEmailValidation(arrayOfEmails[i]) ){
          $allEmailsValid = false;
          break;
        }
      }
      
      if( $allEmailsValid )
        this.favorite.set({autoccTo: $emailList});
    },
    syncParameter: function(e) {
      var $target = $(e.target);
      var $index = $target.closest('[data-index]').data('index');
      var key = $target.data('additional-parameter');
      var value = $target.val();
      var params = this.favorite.get('additional_parameters');
      params = _.clone(params, true);
      params[$index][key] = value;
      if(key === 'column' && value !== '__static__') {
        params[$index].value = '';
      }
      if($target.is('select')) {
        this.favorite.set('additional_parameters', params);
      } else {
        this.favorite.attributes.additional_parameters = params;
      }
    },
    selectTarget: function(e) {
      $(e.currentTarget).toggleClass('active');
    },
    removeSelected: function() {
      var indexes = [];
      this.$el.find('[data-select].active').each(function() {
        indexes.push($(this).data('select'));
      });
      this.favorite.removeTargets(indexes);
      this.render();
    },
    checkColumns: function(e) {
      var $target = e.currentTarget || e;
      var data = this.getData($target);
      var $input = $($target);
      var _this = this;
      if($input.is(':checked')) {
        this.alterLoading(1);
        this.beforeSend();
        $.ajax(URLS['ajax_columns_matched'], {
          data: {
            header_id: this.favorite.get('header_id'),
            rsid: data.rsid,
            relation_id: data.relation_id
          },
          dataType: 'json',
          type: 'POST'
        }).then(function(info) {
          _this.alterLoading(-1);
          if(!info || typeof info.columns_match === 'undefined' || !info.columns_match) {
            $input.prop('checked', false);
            alert("The columns of this target do not match!");
          }
        });
      }
    },
    beforeSend: function(){
      console.log("WOW");
      this.setLoading(true);
    },
    alterLoading: function(amount) {
      this.numLoading = (this.numLoading || 0) + amount;
      this.$el.find('.checking')[this.numLoading >= 1 ? 'show' : 'hide']();
    },
    checkTarget: function(e) {
      var $target = $(e.currentTarget);
      var className = '.check-target';
      var $input = $target.is(className) ? $target : $target.find(className);
      $input.prop('checked', !$input.is(':checked'));
      this.checkColumns($input[0]);
    },
    addSelected: function() {
      var _this = this;
      var targets = [];
      this.$el.find('.check-target:checked').each(function() {
        targets.push(_this.getData(this));
      });
      this.favorite.addTargets(targets);
      this.toggleTargets();
      this.render();
    },
    toggleDisplay: function(e) {
      var $target = $(e.currentTarget);
      var $dropdown = $target.siblings('dl.nice.vertical');
      $dropdown.toggle();
      var src = $dropdown.is(':hidden') ? 'right': 'down';
      $target.children('img').attr('src', '/images/arrow-' + src + '.png');
    },
    getData: function(el) {
      var $relationId = $(el).closest('[data-suite-relation-id]');
      var $rsid = $relationId.closest('.add-target').find('[target-rsid]');
      return {
        display_name: $rsid.find('.name').text() + ': ' + $relationId.find('.name').text(),
        relation_id: $relationId.data('suite-relation-id'),
        rsid: $rsid.attr('target-rsid')
      };
    },
    toggleReport: function(e) {
      $(e.currentTarget).siblings('dl').toggle(600);
    },
    getViewContext: function() {
      return _.extend(RenderView.prototype.getViewContext.apply(this, arguments), {
        favorite: this.favorite && this.favorite.attributes || {}
      });
    },
    changeGroup: function(e) {
      this.model.set('group', parseInt($(e.currentTarget).attr('group-id')));
    },
    stopPropagation: function(e) {
      e && e.stopPropagation();
    },
    runAction: function(e) {
      var actionName = $(e.currentTarget).data('action');
      if(actionName && _.isFunction(this[actionName])) {
        this[actionName](e);
      }
    },
    beforeRender: function() {
      this.scrollTop = this.$('.links-table-container').scrollTop();
    },
    afterRender: function() {
      if(this.scrollTop) {
        this.$('.links-table-container').scrollTop(this.scrollTop);
      }
      this.$('.include-cl').iButton();
      var $el = $(this.el);
      var curRelationId = $el.data('relation-id');
      var curRsid = $el.data('rsid');
      var dd = $('a[target-rsid="' + curRsid + '"]')
        .parent()
        .find('a[data-suite-relation-id=' + curRelationId+ ']')
        .parents('dd')
        .first();
      dd.remove();
    },
    syncVariable: function(e) {
      if(e.currentTarget && this.favorite) {
        var $target = $(e.currentTarget);
        var type = $target.attr('type');
        var value;
        if(type === 'checkbox') {
          value = $target.is(':checked');
        } else if (type === 'text' || $target.data('sync') == 'tracking_parameter_type') {
          value = $target.val();
        } else {
          throw new Error('Unknown sync type "' + type + '."');
        }
        this.favorite.set($target.data('sync'), value);
      }
    },
    refreshSaintTable: function() {
      if (confirm('This action will override your existing table.\nAre you sure?')) {
        var favorite = this.favorite;
        this.close();
        favorite.refresh();
      }
    },
    toggleTargets: function() {
      // Don't trigger render
      var showingTargets;
      showingTargets = this.model.attributes.showing_targets = !this.model.get('showing_targets');
      var showing, hiding, showingDir;
      if(showingTargets) {
        showing = '#secondary';
        hiding = '#main';
        showingDir = 'right';
      } else {
        showing = '#main';
        hiding = '#secondary';
        showingDir = 'left';
      }
      this.$(showing).show('slide', { direction: showingDir}, 500);
      this.$(hiding).hide();
    },
    setFavorite: function(favorite) {
      if(this.favorite) {
        this.stopListening(this.favorite);
      }
      this.favorite = favorite;
      if(this.favorite) {
        this.listenTo(this.favorite, 'change', this.render);
      }
      this.render();
    },
    save: function() {
      var promise = this.favorite.save();
      this.close();
      return promise;
    },
    open: function() {
      this.$el.show().reveal();
    },
    close: function() {
      this.$el.trigger('reveal:close');
      this.setFavorite();
    }
  });

  function singleEmailValidation(value){
    var retVal = false;
    var at = value.indexOf('@');
    var dot = value.lastIndexOf('.');

    if(value==""){
        alert('Please enter a valid email address, or remove the extra delimiter(s)');
        retVal = false;
    } else if (at<1 || dot<at+2 || dot>value.length-2) {
        alert('Please enter a valid email address. ' + value + " is not valid.");
        retVal = false;
    } else {
      retVal = true;
    }
    return retVal;
  }

  var ManagerList = RenderView.extend({
    className: 'manage-list',
    initialize: function(options) {
      this.options = options;
      this.listenTo(this.model, 'add remove reset change', this.render);
    },
    events: {
      'click [data-select]': 'selectEntry',
      'click [data-action="refreshList"]': 'refreshList',
      'keyup [data-filter]': 'filterList'
    },
    filterList: function(e) {
      var search = $(e.currentTarget).val().toLowerCase();
      var elems = this.$el.find('[data-select]');
      if(search) {
        elems.each(function() {
          if(-1 !== $(this).data('select').toLowerCase().indexOf(search)) {
            this.style.display = 'block';
          } else {
            this.style.display = 'none';
          }
        });
      } else {
        elems.show();
      }
    },
    refreshList: function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      this.trigger('list:refresh', this);
    },
    selectEntry: function(e) {
      var $target = $(e.currentTarget);
      this.trigger('entry:select', this.model.get($target.data('id')));
      this.render();
    },
    isSelected: function(val) {
      return this.options.isSelected(val);
    },
    getDisplay: function(val) {
      return this.options.getDisplay(val);
    },
    beforeRender: function() {
      this.scrollTop = this.$('.list').scrollTop();
      this.searchTerm = (this.$('[data-filter]').val() || '').toLowerCase();
    },
    afterRender: function() {
      this.$('.list').scrollTop(this.scrollTop);
    }
  });

  var ReportManagerView = RenderView.extend({
    className: 'report-manager',
    initialize: function() {
      this.listenTo(this.model, 'add remove reset change', this.render);
      this.selectedSuites = new Backbone.Collection();
    },
    events: {
      'click [data-action]': 'runAction',
    },
    runAction: function(e) {
      var action = $(e.currentTarget).data('action');
      if(this[action]) this[action](e);
    },
    getSuitesView: function() {
      var _this = this;
      var title = 'Select a' + (this.options.hideOmniture ? 'n Account' : ' Report Suite');
      return new ManagerList({
        model: this.model,
        title: 'First: ' + title,
        getDisplay: function(model) {
          return model.get('site_title');
        },
        isSelected: function(model) {
          return _this.selected && _this.selected.id === model.id;
        }
      });
    },
    getReportsView: function() {
      var _this = this;
      return new ManagerList({
        model: this.selectedSuites,
        title: 'Second: Select a Report',
        getDisplay: function(model) {
          return model.get('relation_name');
        },
        isSelected: function(model) {
          return window.favorites.getFavorite(_this.selected.get('rsid'), model.get('relation_id'));
        },
        displayFavorite: true
      });
    },
    componentEvents: {
      'entry:select': 'selectEntry',
      'list:refresh': 'refreshList'
    },
    selectEntry: function(model) {
      if(model instanceof Report) {
        this.selectReport(model);
      } else {
        this.selectSuite(model);
      }
    },
    refreshList: function(child) {
      if(child.options.displayFavorite) {
        this.refreshSuites();
      } else {
        this.refreshReports();
      }
    },
    refreshReports: function() {
      var _this = this;
      if(!this.isLoading) {
        this.selectReport(void 0);
        this.setLoading(true);
        this.model.refresh().then(function() {
          _this.setLoading(false);
        });
      }
    },
    refreshSuites: function() {
      var _this = this;
      if(!this.isLoading && this.selected) {
        this.setLoading(true);
        this.selected.refresh().then(function() {
          _this.setLoading(false);
        });
      }
    },
    setLoading: function(isLoading) {
      this.isLoading = isLoading;
      this.$el.find('.loading')[isLoading ? 'show' : 'hide']();
    },
    selectReport: function(selected) {
      if(this.selected) {
        this.stopListening(this.selected, 'change:suites', this.setSelectedSuites);
      }
      this.selected = (selected && selected.id) !== (this.selected && this.selected.id) 
        ? selected : undefined;
      if(this.selected) {
        this.listenTo(this.selected, 'change:suites', this.setSelectedSuites);
      }
      this.setSelectedSuites();
    },
    setSelectedSuites: function() {
      this.selectedSuites.reset();
      if(this.selected) {
        this.selectedSuites.add(this.selected.get('suites'));
      }
    },
    selectSuite: function(selected) {
      this.trigger('favorite:toggle', {
        rsid: this.selected.get('rsid'),
        relation_id: selected.get('relation_id'),
        site_title: this.selected.get('site_title'),
        relation_name: selected.get('relation_name')
      });
    },
    open: function() {
      this.render();
      this.$el.show().reveal();
    },
    close: function() {
      this.$el.trigger('reveal:close');
    }
  });

  var FavoriteListView = RenderView.extend({
    className: 'favorite-list',
    initialize: function(options) {
      this.listenTo(this.model, 'add remove', this.render);
      this.settingsModal = new SettingsModalView({
        hideOmniture: options.hideOmniture,
        el: options.settingsModal[0],
        reportList: options.reportList
      });
      this.reportListManager = new ReportManagerView({
        hideOmniture: options.hideOmniture,
        el: options.reportListManagerModal[0],
        model: options.reportList
      });
      this.listenTo(this.reportListManager, 'favorite:toggle', this.toggleFavorite);
      this.reportListManager.render();
      this.isAdmin = options.isAdmin;
    },
    componentEvents: {
      'settings:open': 'openSettings',
    },
    toggleFavorite: function(data) {
      var favorite = this.model.getFavorite(data.rsid, data.relation_id);
      if(favorite) {
        this.model.removeFavorite(favorite);
      } else {
        this.model.createFavorite(data);
      }
    },
    openSettings: function(favorite, relation_id, rsid) {
      $(this.settingsModal.el)
        .data('relation-id', relation_id)
        .data('rsid', rsid);
      this.settingsModal.setFavorite(favorite);
      this.settingsModal.open();
    },
    getFavoriteView: function($el) {
      return new FavoriteView({
        model: this.model.get($el.data('model')),
        isAdmin: this.isAdmin
      });
    },
    manageReportList: function() {
      this.reportListManager.open();
    }
  });

  var FavoriteView = RenderView.extend({
    className: 'favorite',
    events: {
      'click .favorite-inner > h2': 'toggleExpanded',
      'click .settings': 'openSettings',
      'click .restart_import': 'restartImport',
    },
    initialize: function(options) {
      this.listenTo(this.model, 'change', this.render);
      this.expanded = false;
      this.isAdmin = options.isAdmin;
    },
    isLoading: function() {
      return this.model.isLoading();
    },
    beforeRender: function() {
      var $children = this.$el.find('.children');
      if(this.expanded && (!this.model.get('initialized') || this.model.get('refreshing'))) {
        this.expanded = false;
      }
    },
    getPatternListView: function() {
      return new PatternListView({
        model: this.model.get('patterns')
      });
    },
    restartImport: function() {
      if(confirm('Are you sure that you want to restart this import?')) {
        alert('restarting import');
        $.post('/app/ajax/restart_import', 'favorite_id=' + this.model.id);
      }
    },
    openSettings: function(e) {
      e && e.stopImmediatePropagation && e.stopImmediatePropagation();
      this.trigger('settings:open', this.model, $(e.currentTarget).data('relation-id'), $(e.currentTarget).data('rsid'));
    },
    toggleExpanded: function() {
      var $children = this.$el.find('.children');
      this.expanded = $children.is(':hidden');
      $children.slideToggle();
    },
    getPatterns: function($el) {
      return this.model.get('patterns');
    }
  });

  var PatternListView = RenderView.extend({
    className: 'pattern-list',
    initialize: function() {
      this.listenTo(this.model, 'add remove', this.render);
    },
    componentEvents: {
      'pattern:delete': 'deletePattern'
    },
    getPatternView: function($el) {
      return new PatternView({
        model: this.model.get($el.data('model'))
      });
    },
    addPattern: function(pattern) {
      this.model.add(pattern);
    },
    deletePattern: function(patternId) {
      var _this = this;
      this.model.deletePattern(patternId);
    }
  });
  var PatternView = RenderView.extend({
    className: 'pattern',
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },
    events: {
      'click .delete': 'deletePattern',
      'click .clone': 'clonePattern'
    },
    deletePattern: function() {
      this.trigger('pattern:delete', this.model.id);
    },
    clonePattern: function() {
      var _this = this;
      var attrs = this.model.attributes;
      window.cloneModal.open(this.model.id, attrs.rsid, attrs.relation_id, attrs.friendly_name + ' (Cloned)')
      .then(function(pattern) {
        window.favorites.addPattern(new Pattern(pattern));
      });
    }
  });

  window.SelectSuites = {
    FavoriteListView: FavoriteListView,
    FavoriteList: FavoriteList,
    ReportList: ReportList,
  };

  Handlebars.registerHelper('path', function(path) {
      return URLS[path];
  });
  Handlebars.registerHelper('asset', function(asset) {
      return ASSETS[asset];
  });
  Handlebars.registerHelper('encode', encodeURIComponent);
  Handlebars.registerHelper('foreach', function(items, /*other, */ options) {
    var otherArguments = [].slice.call(arguments, 1, arguments.length - 1);
    options = arguments[arguments.length - 1];
    if(!items || !items.map) { return ''; }
    return items.map(function(item, i) {
      if(!_.isObject(item)) { 
        item = {item: item};
      }
      return options.fn(_.extend({}, item, {$index: i, $other: otherArguments, parent: this}));
    }, this).join('');
  });
  Handlebars.registerHelper("xif", function (expression, options) {
      return Handlebars.helpers["x"]
        .apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
    });

  Handlebars.registerHelper('jwt', function(expression) {
    var configured = NODEJS.configure();
    if(!configured[expression]) {
      throw new Error('Invalid nodejs attribute ' + expression);
    }
    return configured[expression];
  });

   Handlebars.registerHelper('timezone_offset', function(date) {
    var clientCurrentDate = new Date();
    var timezoneOffset = clientCurrentDate.getTimezoneOffset();
     return timezoneOffset;
  });


  Handlebars.registerHelper("x", function (expression, options) {
    var fn = function(){}, result;

    // in a try block in case the expression have invalid javascript
    try {
      // create a new function using Function.apply, notice the capital F in Function
      fn = Function.apply(
        this,
        [
          'window', // or add more '_this, window, a, b' you can add more params
                    // if you have references for them when you call fn(window, a, b, c);
          'return ' + expression + ';' // edit that if you know what you're doing
        ]
      );
    } catch (e) {
      console.warn('[warning] {{x ' + expression + '}} is invalid javascript', e);
    }

    // then let's execute this new function, and pass it window, like we promised
    // so you can actually use window in your expression
    // i.e expression ==> 'window.config.userLimit + 10 - 5 + 2 - user.count' //
    // or whatever
    try {
      // if you have created the function with more params
      // that would like fn(window, a, b, c)
      result = fn.bind(this)(window);
    } catch (e) {
      console.warn('[warning] {{x ' + expression + '}} runtime error', e);
    }
    // return the output of that result, or undefined if some error occured
    return result;
  });
});
