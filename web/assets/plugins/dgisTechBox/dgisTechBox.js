var DGISTechBox = function () {
    this.renderByDomId = function (domId) {
        var dom = $("#" + domId);
        var width = dom.width() + 10;
        var height = dom.height() + 10;

        var domId = dom.attr("id");

        var div = "<div class=\"tech_box\" style=\"width: " + width + "px;height: " + height + "px;\">        <div class=\"lth corner\" style=\"width: 20px;height: 4px;left: -2px;top:-2px;\"></div>        <div class=\"ltv corner\" style=\"width: 4px;height: 20px;left: -2px;top:-2px;\"></div>        <div class=\"rth corner\" style=\"width: 20px;height: 4px;right: -2px;top:-2px;\"></div>        <div class=\"rtv corner\" style=\"width: 4px;height: 20px;right: -2px;top:-2px;\"></div>        <div class=\"lbh corner\" style=\"width: 20px;height: 4px;left: -2px;bottom:-2px;\"></div>        <div class=\"lbv corner\" style=\"width: 4px;height: 20px;left: -2px;bottom:-2px;\"></div>        <div class=\"rbh corner\" style=\"width: 20px;height: 4px;right: -2px;bottom:-2px;\"></div>        <div class=\"rbv corner\" style=\"width: 4px;height: 20px;right: -2px;bottom:-2px;\"></div>        <div  class=\"content\" >" + dom.prop("outerHTML") + "</div>    </div>";
        dom.prop("outerHTML", div);
    };
    this.renderByDomClass = function (domClass) {
        var doms = $("." + domClass);
        for (var i = 0; i < doms.length; i++) {
            var dom = $(doms[i]);

            var width = dom.width() + 10;
            var height = dom.height() + 10;

            var domId = dom.attr("id");

            var div = "<div class=\"tech_box\" style=\"width: " + width + "px;height: " + height + "px;\">        <div class=\"lth corner\" style=\"width: 20px;height: 4px;left: -2px;top:-2px;\"></div>        <div class=\"ltv corner\" style=\"width: 4px;height: 20px;left: -2px;top:-2px;\"></div>        <div class=\"rth corner\" style=\"width: 20px;height: 4px;right: -2px;top:-2px;\"></div>        <div class=\"rtv corner\" style=\"width: 4px;height: 20px;right: -2px;top:-2px;\"></div>        <div class=\"lbh corner\" style=\"width: 20px;height: 4px;left: -2px;bottom:-2px;\"></div>        <div class=\"lbv corner\" style=\"width: 4px;height: 20px;left: -2px;bottom:-2px;\"></div>        <div class=\"rbh corner\" style=\"width: 20px;height: 4px;right: -2px;bottom:-2px;\"></div>        <div class=\"rbv corner\" style=\"width: 4px;height: 20px;right: -2px;bottom:-2px;\"></div>        <div  class=\"content\" >" + dom.prop("outerHTML") + "</div>    </div>";
            dom.prop("outerHTML", div);
        }
    };

    return this;
};
