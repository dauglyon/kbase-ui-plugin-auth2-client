define(['knockout', 'kb_knockout/registry', 'kb_knockout/lib/subscriptionManager', 'kb_lib/html'], function (
    ko,
    reg,
    SubscriptionManager,
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        label = t('label'),
        span = t('span'),
        input = t('input');

    function template() {
        return div(
            {
                if: 'ready'
            },
            div(
                {
                    dataBind: {
                        foreach: 'checkboxesData'
                    }
                },
                div(
                    {
                        class: 'checkbox'
                    },
                    label(
                        {
                            style: {
                                marginLeft: '1em'
                            }
                        },
                        [
                            input({
                                type: 'checkbox',
                                dataBind: {
                                    checked: 'checked',
                                    value: 'value'
                                }
                            }),
                            span({
                                dataBind: {
                                    text: 'label'
                                }
                            })
                        ]
                    )
                )
            )
        );
    }

    function viewModel(params) {
        var subscriptions = new SubscriptionManager();
        // incoming is an observable array of strings ...
        var upstreamValue = params.value;
        // ... and a data source definition for the set of values.
        var dataSource = params.dataSource;

        var ready = ko.observable(false);

        var checkboxesData = ko.observableArray();

        function updateUpstream() {
            var update = checkboxesData()
                .filter(function (item) {
                    return item.checked();
                })
                .map(function (item) {
                    return item.value;
                });
            upstreamValue(update);
        }

        dataSource.getAll().then(function (data) {
            var checkboxValues = data.map(function (item) {
                var isChecked = false;
                if (upstreamValue.indexOf(item.value) >= 0) {
                    isChecked = true;
                }
                var checked = ko.observable(isChecked);
                subscriptions.add(
                    checked.subscribe(function () {
                        updateUpstream();
                    })
                );
                return {
                    value: item.value,
                    label: item.label,
                    checked: checked
                };
            });
            checkboxesData(checkboxValues);
            // checkboxesData.subscribe(function (newValue) {
            //     var update = newValue.map(function (item) {
            //         return item.value;
            //     });
            //     upstreamValue(update);
            // });
            ready(true);
        });

        function dispose() {
            subscriptions.dispose();
        }

        return {
            ready: ready,
            checkboxesData: checkboxesData,
            dispose: dispose
        };
    }

    function component() {
        return {
            template: template(),
            viewModel: viewModel
        };
    }

    return reg.registerComponent(component);
});
