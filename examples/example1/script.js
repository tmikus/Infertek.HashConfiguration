var viewModel = {
    property1: ko.observable(),
    property2: ko.observable(),
    property3: ko.observable()
};

viewModel.onUpdateHash = function () {
    
};

var hashConfiguration = new Infertek.HashConfiguration(viewModel, true);

$(function () {
    ko.applyBindings(viewModel, document.body);
});