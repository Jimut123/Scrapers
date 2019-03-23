function rowSelect() {
    return {
        require: '^stTable',
        template: '<input type="checkbox">',
        scope: {
            row: '=rowSelect'
        },
        link: function (scope, element, attr, ctrl) {
            element.bind('click', function (evt) {
                scope.$apply(function () {
                    ctrl.select(scope.row, 'multiple');
                    scope.row.isSelected = !scope.row.isSelected;
                });
            });
            scope.$watch('row.isSelected', function (newValue) {
                if (newValue === true) {
                    element.parent().addClass('st-selected');
                    element.find('input').prop('checked', true);
                } else {
                    element.parent().removeClass('st-selected');
                    element.find('input').prop('checked', false);
                }
            });
        }
    };
}

angular.module('controlPanelApp').directive('rowSelect', rowSelect)