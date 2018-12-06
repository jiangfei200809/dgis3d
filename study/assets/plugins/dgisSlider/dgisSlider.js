/**
 * DGIS 侧边栏
 * @param {} domId 元素ID
 */
var DgisSlider = function (domId) {
    this.domId = domId;
    this.position = true;
    this.leftIco = '<svg style="vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8640"><path d="M734.2 945c-17.5 17.5-45.8 17.5-63.3 0L300.7 574.8c-35-35-35-91.7 0-126.6l372.9-373c17.3-17.3 45.3-17.5 62.8-0.5 17.9 17.4 18.1 46.1 0.5 63.8L395.7 479.8c-17.5 17.5-17.5 45.8 0 63.3l338.6 338.6c17.4 17.5 17.4 45.8-0.1 63.3z" p-id="8641"></path></svg>';
    this.rightIco = '<svg class="icon" style="vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9237"><path d="M684.569334 450.069509 684.436304 450.202539 339.429643 105.196901 277.56669 167.060877 622.572328 512.066515 277.69972 856.939123 339.563696 918.803099 684.436304 573.930491 746.299257 512.066515 746.43331 511.933485Z" p-id="9238"></path></svg>';


    /**
     * 
     * @param {*} width 边栏长
     * @param {*} height 边栏宽
     * @param {*} top 边栏顶部位置
     * @param {*} isLeft 是否左侧边栏
     * @param {*} isShow 是否显示
     */
    this.init = function (width, height, top, isLeft, isShow) {
        this.position = isLeft;

        var slider = "<div id=\"" + domId + "Slider\" class=\"slider\" style=\"top:" + top + ";" + (isLeft ? "left:-1px" : "right:-1px") + ";width:" + width + ";height:" + height + "\"> <div class=\"sliderContent\" style=\"" + (isLeft ? "float:left" : "float:right") + "\">";
        slider += $("#" + domId).prop("outerHTML");
        slider += "</div><div id=\"" + domId + "SliderTip\" class=\"sliderTip " + (isLeft ? "sliderTipLeft" : "sliderTipRight") + "\">";
        slider += isLeft ? this.leftIco : this.rightIco;
        slider += "</div></div>";

        $("#" + domId).prop("outerHTML", slider);

        $("#" + this.domId + "SliderTip").css("margin-top", $("#" + this.domId + "Slider").height() / 2);

        var a=this;
        $("#" + domId + "SliderTip").on("click", function () {
            a.show();
        });

        if (!isShow)
            this.show();
    };

    this.show = function () {
        var show = $("#" + this.domId + "Slider").css(this.position ? "left" : "right") == "-1px";
        show = !show;

        if (this.position) {
            $("#" + this.domId + "SliderTip").html(show ? this.leftIco : this.rightIco);
        } else {
            $("#" + this.domId + "SliderTip").html(!show ? this.leftIco : this.rightIco);
        }

        var width = $("#" + this.domId + "Slider").width();
        if (this.position) {
            $("#" + this.domId + "Slider").animate({ "left": show ? -1 : width * -1 + 30 });
        } else {
            $("#" + this.domId + "Slider").animate({ "right": show ? -1 : width * -1 + 30 });
        }
    };

    return this;
};
