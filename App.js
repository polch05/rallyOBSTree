Ext.define('Rally.ui.tree.DescriptionRichTextView', {
    extend: Ext.view.View,
    alias: 'widget.treedescriptionrichtextview',

    cls: 'description-richtextview',

    initComponent: function() {
        this.callParent(arguments);
        this._createTpl();

    },

    constructor: function(config) {
        this.mergeConfig(config);
        this.callParent(arguments);
    },

    _createTpl: function() {
        this.tpl = new Ext.XTemplate(
            '<tpl>',
                '<div class="description">{[this.getDetails()]}</div>',
            '</tpl>'
        );

        this.tpl.self.addMembers({
            getDetails: Ext.bind(function(record) {
                return record.get('Description');
            }, this)
        });
    }
});

Ext.define('Rally.ui.tree.EditorsList', {
    extend: Ext.view.View,
    alias: 'widget.treeeditorslist',

    cls: 'description-richtextview',

    initComponent: function() {
        this.callParent(arguments);
        this._createTpl();

    },

    constructor: function(config) {
        this.mergeConfig(config);
        this.callParent(arguments);
    },

    _createTpl: function() {
        this.tpl = new Ext.XTemplate(
            '<tpl>',
                '<div class="description">{[this.getDetails()]}</div>',
            '</tpl>'
        );

        this.tpl.self.addMembers({
            getDetails: Ext.bind(function(record) {
                return record.get('Description');
            }, this)
        });
    }
});


Ext.define( 'Rally.ui.tree.extendedTreeItem' , {
    alias: 'widget.extendedTreeItem',
    extend: 'Rally.ui.tree.TreeItem',
    config: {
        displayedFields: ['Name', 'Description', 'TeamMembers']
    },

    draw: function() {
        var me = this;

        if (this.content) {
            this.content.destroy();
        }

        var cls = 'treeItemContent';
        if (this.getSelectable()) {
            cls += ' selectable';
        }

        if (!this.expander) {
            this.expander = this.drawExpander();
        } else {
            this.toggleExpander();
        }

        this.insert(1, {

            xtype: 'container',
            itemId: 'treeItemContent',
            cls: cls,
            layout: {
                type: 'hbox'
            },
            items: [
                {
                    xtype: 'component',
                    renderTpl: this.getContentTpl(),
                    renderData: this.getRenderData(),
                    listeners: {
                        afterrender: function() {
                            this.setupListeners();
                            this.fireEvent('draw');
                        },
                        scope: this
                    }
                },
                {
                    xtype: 'container',
                    itemId: 'userInfoRecord',
                    layout: {
                        type: 'hbox'
                    },
                    style: {
                        marginLeft: '50px'
                    },
                    listeners: {
                        afterrender: function(cmp) {
                            var treeItem = me;

                            var record = me.getRecord();
                            record.getCollection('TeamMembers').load().then({
                                success: function(data) {
                                    _.each(data, function(member) {
                                        cmp.add(
                                            {   xtype: 'container',
                                                cls: 'rally-textfield-component',
//                                                itemId: 'teamMembersInfo',
                                                style: { marginLeft: '10px'},
                                                html: member.get('_refObjectName')
                                            }
                                        );
                                    });
                                }
                            });
                        }
                    }
                }
            ]
        });

    }
});

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {

        var app = this;
       var pt = Ext.create( 'Rally.ui.tree.ProjectTree', {
        config: {
            treeItemConfigForRecordFn:  function(record) {
                if (record.get('_type') === 'workspace'){
                    return { xtype: 'rallyplaintreeitem' };
                }
                else {
                    return {
                        xtype: 'extendedTreeItem',
                        selectable: true
                    };
                }
            },
            topLevelStoreConfig: {
                fetch: ['Name', 'Editors', 'State', 'Workspace'],
                filters: [{
                    property: 'State',
                    value: 'Open'
                }, {
                    property: 'Projects.State',
                    value: 'Open'
                }],
                sorters: [{
                    property: 'Name',
                    direction: 'ASC'
                }],
                context: function() { app._getContext(app); }
            },

            childItemsStoreConfigForParentRecordFn: function(record){

                var storeConfig = {
                    fetch: ['Name', 'Editors', 'Description', 'Children:summary[State]', 'State', 'Workspace', 'Owner'],
                    hydrate: [ 'Editors', 'Owner' ],
                    sorters: [{
                        property: 'Name',
                        direction: 'ASC'
                    }]
                };

                if(record.get('_type') === 'workspace'){
                    return Ext.apply(storeConfig, {
                        filters: [{
                            property: 'Parent',
                            value: 'null'
                        }],
                        context: {
                            workspace: record.get('_ref'),
                            project: null
                        }
                    });
                } else {
                    return Ext.apply(storeConfig, {
                        filters: [{
                            property: 'Parent',
                            value: record.get('_ref')
                        }],
                        context: {
                            workspace: record.get('Workspace')._ref,
                            project: null
                        }
                    });
                }
            }
        }
       });

       this.add(pt);
    }
});
