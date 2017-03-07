import BaseControl from './BaseControl'
import Point from './Point'
import {
    parseMath
} from 'jqmath'
let Fraction = require('fraction.js');
let Snap = require('snapsvg');
export default class GraphControl extends BaseControl {
    /**
     * 单例
     */
    static _inst;

    static getInst() {

        GraphControl._inst = GraphControl._inst || new GraphControl();

        return GraphControl._inst;
    }

    /**
     * 构造
     */
    constructor() {
        super();
    }

    /**
     * 析构
     */
    destroy() {

        this.unbindEvent();
        this.canvas = null;
        this.unitTextContainer = null;
        this.domContainer = null;
        this.menuContainer = null;
        this.textBoxContainer = null;
        this.transformContainer = null;
        this.editBtn = null;
        this.menuWrapper = null;
        GraphControl._inst = null;
    }

    /**
     * 初始化事件
     */
    init(app) {

        this.app = app;
        // 初始化svg界面
        var uid = 'svg' + this.uuid();
        this.container = this.app.$view.find('.NewNumberLine_stage');
        this.container.html('<svg id="' + uid + '" style="width: 100%;height: 100%;" ></svg>');
        this.$svg = this.app.$view.find('#' + uid);
        this.svg = Snap('#' + uid).data({
            type: 'canvas'
        });

        // svg绘制参数设置
        this.svgWidth = this.$svg.width();
        this.svgHeight = this.$svg.height();

        this.transformPosition = {
            x: this.svgWidth / 2,
            y: this.svgHeight * this.app.config.yRatio
        };

        this.canvas = this.svg.g().addClass('canvas');
        this.unitTextContainer = this.app.$view.find('.unitTextContainer');
        this.domContainer = this.app.$view.find('.domContainer');
        this.menuContainer = this.app.$view.find('.menuContainer');
        this.textBoxContainer = this.app.$view.find('.textBoxContainer');
        this.menuWrapper = this.app.$view.find('.menuWrapper');
        this.transformContainer = this.app.$view.find('.transformContainer');
        this.editBtn = this.app.$view.find('.editBtnContainer .editImage');
        this.transformContainer.css({
            "margin-top": this.app.config.unitTextGap + 'px'
        });
        this.menuWrapper.css({
            "margin-top": this.app.config.unitTextGap + 'px'
        });
        this.pattern = this.svg.image(this.app.config.basePath + 'resources/images/pattern.png', 0, 0,
                parseInt(60 * this.app.config.fontSize / 24), parseInt(60 * this.app.config.fontSize / 24))
            .pattern(0, 0, parseInt(60 * this.app.config.fontSize / 24), parseInt(60 * this.app.config.fontSize / 24)).attr({
                patternTransform: 'rotate(-45)'
            });

        Snap.plugin(function(Snap, Element, Paper, glob) {

            var elproto = Element.prototype;

            elproto.toFront = function(target) {
                if (target) {
                    this.appendTo(target);
                    return this
                }
                this.appendTo(this.paper);
            };
            elproto.toBack = function(target) {
                if (target) {
                    this.prependTo(target);
                    return this
                }
                this.prependTo(this.paper);
            };
            elproto.setPosition = function(position) {
                switch (this.type) {
                    case 'circle':
                        if (position.y !== undefined) {
                            this.attr({
                                'cy': position.y
                            })
                        }

                        if (position.x !== undefined) {
                            this.attr({
                                'cx': position.x
                            })
                        }
                        break;

                    case 'image':
                        let width = +this.attr('width');
                        if (position.y !== undefined) {

                            this.attr({
                                'y': position.y
                            })
                        }

                        if (position.x !== undefined) {
                            this.attr({
                                'x': position.x - width / 2
                            })
                        }
                        break;
                    case 'line':
                        if (position.y !== undefined) {
                            this.attr({
                                'y1': position.y,
                                'y2': position.y,
                            })
                        }

                        if (position.x !== undefined) {
                            this.attr({
                                'x1': position.x,
                                'x2': position.x
                            })
                        }
                        if (position.x1 !== undefined) {
                            this.attr({
                                'x1': position.x1
                            })
                        }

                        if (position.x2 !== undefined) {
                            this.attr({
                                'x2': position.x2
                            })
                        }

                        break;
                    default:

                        if (position.y !== undefined) {
                            this.attr({
                                'y': position.y
                            })
                        }

                        if (position.x !== undefined) {
                            this.attr({
                                'x': position.x
                            })
                        }
                        break;
                }
            }

        });

        this.drawBasic();
        this.bindEvent();

        return this;

    }

    /**
     * 生成id
     * @return {[string]} [返回随机字符串]
     */
    uuid() {

        let s = [],
            hexDigits = '0123456789abcdef';

        for (let i = 0; i < 10; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }

        return s.join('');

    }

    /**
     * 绘制基本界面
     */
    drawBasic() {
        this.getDivision();
        this.axisGroup = this.svg.g().addClass('axisGroup');
        this.unitGroup = this.svg.g().addClass('unitGroup');
        this.drawAxis();
        this.drawUnits();
        this.axisGroup.add(this.unitGroup);
        this.canvas.add(this.axisGroup);
        this.drawunitTexts();
        this.drawArrow(this.app.config.arrowWidth, this.app.config.arrowHeight);
        this.drawControlArea();
        this.drag();

    }

    // 根据类型更新数轴
    updateByType(type) {

        switch (type) {
            case 'move':
                this.updateUnits();
                this.updateUnitTexts();
                break;

            case 'unitChange':
                this.getDivision();
                this.updateUnits();
                this.updateUnitTexts();
                this.drawControlArea();
                break;

            case 'stretch':
                this.getDivision(true);
                this.updateUnits();
                this.updateUnitTexts();
                this.drawControlArea();
                break;

            case 'jump':

                break;
            case 'noNumber':
                this.getDivision();
                this.updateUnits();
                this.updateUnitTexts();
                this.drawControlArea();
                break;

            default:
                this.getDivision();
                this.updateUnits();
                this.updateUnitTexts();
                this.drawControlArea();
                break;
        }

    }

    /*getAxisRange(){
    	let leftValue = New Fraction(this.app.config.minValue).sub(this.app.config.unitValue/2);
    	let rightValue = New Fraction(this.app.config.maxValue).add(this.app.config.unitValue/2);

    }*/

    // 数轴左右格数
    // 
    getDivision(isScale) {

        this.app.config.leftDivision = new Fraction(this.svgWidth).div(2).div(this.app.config.unitLength);
        this.app.config.rightDivision = new Fraction(this.svgWidth).div(2).sub(this.app.config.arrowWidth)
            .sub(this.app.config.pointRadius).div(this.app.config.unitLength);

        if (isScale) {
            let maxValue = this.app.config.rightDivision.mul(this.app.config.unitValue).add(this.app.config.centerValue);
            let minValue = this.app.config.leftDivision.mul(this.app.config.unitValue).neg().add(this.app.config.centerValue);
            let extraValue = new Fraction(this.app.config.unitValue).div(2);

            if (minValue.compare(extraValue.neg().add(this.app.config.minValue)) < 0) {
                this.app.config.centerValue = new Fraction(this.app.config.minValue).sub(extraValue).add(this.app.config.leftDivision.mul(this.app.config.unitValue)).valueOf();
            } else if (maxValue.compare(extraValue.add(this.app.config.maxValue)) > 0) {
                this.app.config.centerValue = new Fraction(this.app.config.maxValue).add(extraValue).sub(this.app.config.rightDivision.mul(this.app.config.unitValue)).valueOf();
            }
        }

    }

    // 数轴中点位置离左右整格的位置
    getMod() {

        let leftMod, rightMod;
        let centerValue = new Fraction(this.app.config.centerValue);

        if (centerValue.compare(0) > 0) {
            let subValue = new Fraction(this.app.config.centerValue).mod(this.app.config.unitValue);
            leftMod = subValue.div(this.app.config.unitValue);
            rightMod = new Fraction(this.app.config.unitValue).sub(subValue).div(this.app.config.unitValue);
        } else {
            let subValue = new Fraction(this.app.config.centerValue).mod(this.app.config.unitValue);
            leftMod = new Fraction(this.app.config.unitValue).add(subValue).div(this.app.config.unitValue);
            rightMod = subValue.div(this.app.config.unitValue).abs();
        }

        return {
            leftMod,
            rightMod
        }

    }

    // 数轴右边预留箭头以及点半径距离所占据的格数
    getArrowGrid() {
        return new Fraction(this.app.config.arrowWidth).add(this.app.config.pointRadius / 2).div(this.app.config.unitLength)
    }

    /**
     * 数轴当前的数值范围
     * @param  {[number]} val [可选参数，传入时判断数值是否超出当前数轴范围超出返回null]    
     * @param  {[boolean]} round [可选参数，点击添加点传入时将数值进行取整]
     * @return {[obj || boolean]}     [无val值时返回数轴的数值范围对象 leftValue为左边界 rightValue为右边界]
     */
    getCurrentRange(val, round) {

        let curValue = null;
        let leftValue = new Fraction(-this.app.config.leftDivision).mul(this.app.config.unitValue).add(this.app.config.centerValue);
        let rightValue = new Fraction(this.app.config.rightDivision).mul(this.app.config.unitValue).add(this.app.config.centerValue);

        if (val === undefined) {
            return {
                leftValue,
                rightValue
            }
        }

        if (round) {
            curValue = val.round(1);
        } else {
            curValue = val;
        }

        if (curValue.compare(this.app.config.maxValue) > 0 || curValue.compare(this.app.config.minValue) < 0) {
            return null
        }

        if (curValue.compare(leftValue) < 0 || curValue.compare(rightValue) > 0) {
            return null
        } else {
            return true
        }

    }


    resetTransformPosition() {

        this.transformPosition = {
            x: this.svgWidth / 2,
            y: this.svgHeight / 2
        };

    }

    // 绘制当前数轴上的所有分隔线
    drawUnits() {

        let mod = this.getMod();

        for (let i = mod.leftMod; i.compare(this.app.config.leftDivision) <= 0; i = i.add(1)) {
            if (i.neg().mul(this.app.config.unitValue).add(this.app.config.centerValue).round(2).compare(this.app.config.minValue) < 0) {
                break;
            }
            this.unitGroup.add(this.drawUnit(i.neg()));
        }

        for (let i = mod.rightMod; i.compare(this.app.config.rightDivision) <= 0; i = i.add(1)) {
            if (i.mul(this.app.config.unitValue).add(this.app.config.centerValue).round(2).compare(this.app.config.maxValue) > 0) {
                break;
            }
            this.unitGroup.add(this.drawUnit(i));
        }

    }

    // 具体单个分隔线绘制
    drawUnit(i) {

        let val;

        let unit = this.svg.line(this.app.config.unitLength * i, -this.app.config.unitHeight / 2, this.app.config.unitLength * i, +this.app.config.unitHeight / 2).attr({
            fill: 'none',
            stroke: this.app.config.baseColor,
            strokeWidth: this.app.config.unitWidth
        }).addClass('unit');

        val = i.mul(this.app.config.unitValue).add(this.app.config.centerValue);

        if (val.round(2).compare(0) == 0) {
            let circle = this.svg.circle(this.app.config.unitLength * i, 0, this.app.config.originCircleRadius).attr({
                fill: this.app.config.baseColor
            }).addClass('originPoint');

            unit.addClass('originPointUnit');
            this.unitGroup.add(circle);
        }

        return unit

    }

    // 具体分隔线更新
    updateUnit() {

        let mod = this.getMod();
        let index = parseInt(this.app.config.totalDivision / 2);
        let unitGroup = [].slice.call(this.unitGroup.selectAll('.unit'));
        let centerUnitPos = +unitGroup[index].attr('x1');

        [].slice.call(unitGroup).map((unit, i) => {
            unit.setPosition({
                x: centerUnitPos + (i - index) * this.app.config.unitLength
            })
        })

    }

    // 更新所有的分隔线
    updateUnits() {

            if (this.unitGroup) {
                this.unitGroup.remove();
                this.unitGroup = this.svg.g().addClass('unitGroup');
                this.axisGroup.add(this.unitGroup);
                this.drawUnits();

                let controlArea = this.axisGroup.select('.controlArea');
                controlArea.toFront(this.axisGroup);
            }

        }
        // 绘制数轴上所有的下标
    drawunitTexts() {

        let mod = this.getMod();

        if (this.app.config.noNumber) {
            let range = this.getCurrentRange();

            if (range.leftValue.compare(1) > 0 || range.rightValue.compare(0) < 0) {
                return
            }

            for (let i = mod.leftMod; i.compare(this.app.config.leftDivision) <= 0; i = i.add(1)) {
                if (i.neg().mul(this.app.config.unitValue).add(this.app.config.centerValue).round(2).compare(this.app.config.minValue) < 0) {
                    break;
                }
                let currentValue = i.neg().mul(this.app.config.unitValue).add(this.app.config.centerValue).round(2);
                currentValue.compare(0) == 0 || currentValue.compare(1) == 0 ? this.unitTextContainer.append(this.drawUnitText(i.neg())) : null;
            }

            for (let i = mod.rightMod; i.compare(this.app.config.rightDivision) <= 0; i = i.add(1)) {

                if (i.mul(this.app.config.unitValue).add(this.app.config.centerValue).round(2).compare(this.app.config.maxValue) > 0) {
                    break;
                }
                let currentValue = i.mul(this.app.config.unitValue).add(this.app.config.centerValue).round(2);
                currentValue.compare(0) == 0 || currentValue.compare(1) == 0 ? this.unitTextContainer.append(this.drawUnitText(i)) : null;
            }
        } else {
            for (let i = mod.leftMod; i.compare(this.app.config.leftDivision) <= 0; i = i.add(1)) {
                if (i.neg().mul(this.app.config.unitValue).add(this.app.config.centerValue).round(2).compare(this.app.config.minValue) < 0) {
                    break;
                }
                this.unitTextContainer.append(this.drawUnitText(i.neg()));
            }

            for (let i = mod.rightMod; i.compare(this.app.config.rightDivision) <= 0; i = i.add(1)) {
                if (i.mul(this.app.config.unitValue).add(this.app.config.centerValue).round(2).compare(this.app.config.maxValue) > 0) {
                    break;
                }
                this.unitTextContainer.append(this.drawUnitText(i));
            }
        }

    }

    // 单个下标的绘制
    drawUnitText(i) {

        let val, text;

        if (this.app.config.fraction) {
            val = this.justifyUnitText(i.mul(this.app.config.unitValue).add(this.app.config.centerValue)).toFraction(true).split(' ').join('}{');
            text = $('<span/>').css({
                left: i.mul(this.app.config.unitLength).valueOf()
            }).addClass('unitText');
            text.html('$${' + val + '}$$');
            parseMath(text[0]);

            let prefix = text.find('.fm-prefix-tight');

            if (prefix.length > 0) {
                prefix.html(prefix.html().replace('−', '-'))
            };
        } else {
            val = i.mul(this.app.config.unitValue).add(this.app.config.centerValue).round(2).valueOf();
            text = $('<span/>').css({
                left: i.mul(this.app.config.unitLength).valueOf()
            }).addClass('unitText');
            text.html(val);
        }

        return text;

    }

    // 更新所有的下标
    updateUnitTexts() {

        if (this.unitTextContainer) {
            this.unitTextContainer.html('');
        }

        this.drawunitTexts();

    }

    // 数轴水平横线绘制及更新
    drawAxis() {

        let Axis = this.axisGroup.select('.Axis');
        // let half = new Fraction(this.app.config.totalDivision / 2);

        if (!Axis) {
            let axis = this.svg.line(this.app.config.leftDivision.neg().mul(this.app.config.unitLength).round(3).valueOf(), 0,
                    this.app.config.leftDivision.mul(this.app.config.unitLength).sub(this.app.config.arrowWidth / 2).round(3).valueOf(), 0)
                .attr({
                    fill: 'none',
                    strokeWidth: this.app.config.axisWidth,
                    stroke: this.app.config.baseColor
                }).addClass('Axis')

            this.axisGroup.add(axis);
            return
        }

        Axis.attr({
            x1: this.app.config.leftDivision.neg().mul(this.app.config.unitLength).round(3).valueOf(),
            x2: this.app.config.leftDivision.mul(this.app.config.unitLength).sub(this.app.config.arrowWidth / 2).round(3).valueOf()
        })

    }

    // 绘制数轴右端箭头
    drawArrow(arrowWidth, arrowHeight) {

        let arrow = this.axisGroup.select('.arrow');
        let half = this.app.config.leftDivision;

        if (arrow) {
            arrow.transform('t' + half.mul(this.app.config.unitLength).sub(this.app.config.arrowWidth).round(3).valueOf() + ' 0');
            return
        }

        let startX = 0;

        let path = `M${startX} ${0 - arrowHeight/2} 
			A${arrowWidth * 1.5} ${arrowHeight/2 * 1.5} 0 0 0 ${startX + arrowWidth} 0
			A${arrowWidth * 1.5} ${arrowHeight/2 * 1.5} 0 0 0 ${startX} ${0 + arrowHeight/2}
			Q${startX} 0 ${startX + arrowHeight/4} 0 
			Q${startX} 0 ${startX} ${0 - arrowHeight/2}`;

        let drawArrow = this.svg.path({
            path: path,
            fill: this.app.config.baseColor
        }).addClass('arrow');

        drawArrow.transform('t' + (half.mul(this.app.config.unitLength).sub(this.app.config.arrowWidth).round(3).valueOf()) + ' 0');
        this.axisGroup.add(drawArrow);
    }

    // 绘制数轴控制区域
    drawControlArea() {

        let controlArea = this.axisGroup.select('.controlArea');
        let height = 0;
        let max = 0;
        let boundary = null;
        let area = null;

        if (controlArea) {
            if (this.app.config.noNumber && this.unitTextContainer.find('span').length < 2) {
                height = +controlArea.attr('height');
            }
            controlArea.remove();
        }

        boundary = this.axisGroup.getBBox();

        if (height == 0) {
            max = this.unitTextContainer.find('span')[0].clientHeight > this.unitTextContainer.find('span')[1].clientHeight ?
                this.unitTextContainer.find('span')[0].clientHeight : this.unitTextContainer.find('span')[1].clientHeight;
            boundary.height += max + this.app.config.unitTextGap - this.app.config.unitHeight / 2;
        } else {
            boundary.height = height;
        }

        area = this.svg.rect(boundary.x, boundary.y, boundary.width, boundary.height).attr({
            fill: '#fff',
            'fill-opacity': 0.001
        }).addClass('controlArea').data({
            type: 'area'
        });
        this.axisGroup.append(area);

    }


    drag({
        x = 0,
        y = 0
    } = {}) {

        let transformString = 't ' + (this.transformPosition.x) + ' ' + this.transformPosition.y;

        this.canvas.transform(transformString);
        this.transformContainer.css({
            "-webkit-transform": "translate(" + (this.transformPosition.x) + "px," + this.transformPosition.y + "px)",
            "transform": "translate(" + (this.transformPosition.x) + "px," + this.transformPosition.y + "px)"
        });

        this.menuWrapper.css({
            "left": (this.transformPosition.x),
            top: this.transformPosition.y
        });
    }

    checkCondition(val) {

        let result = new Fraction(val).div(this.app.config.unitLength).mul(this.app.config.unitValue);
        let baseDivision = new Fraction(val).abs().div(this.app.config.unitLength);
        // 右边限制
        if (val < 0) {
            if (baseDivision.add(this.app.config.rightDivision).mul(this.app.config.unitValue).add(this.app.config.centerValue).sub(new Fraction(this.app.config.unitValue).div(2)).compare(this.app.config.maxValue) > 0) {
                result = new Fraction(this.app.config.maxValue).add(new Fraction(this.app.config.unitValue).div(2)).sub(this.app.config.rightDivision.mul(this.app.config.unitValue)).neg().add(this.app.config.centerValue);
            }
        } else {
            if (baseDivision.add(this.app.config.leftDivision).mul(this.app.config.unitValue).neg().add(this.app.config.centerValue).add(new Fraction(this.app.config.unitValue).div(2)).compare(this.app.config.minValue) < 0) {
                result = new Fraction(this.app.config.minValue).sub(new Fraction(this.app.config.unitValue).div(2)).add(this.app.config.leftDivision
                    .mul(this.app.config.unitValue)).sub(this.app.config.centerValue).neg();
            }
            // return baseDivision.add(this.app.config.leftDivision).mul(this.app.config.unitValue).neg().add(this.app.config.centerValue).compare(this.app.config.minValue) < 0 ? null : result;
        }
        return result
    }


    justifyPoint(val) {

        let module = val.div(this.app.config.unitValue);

        /*if (module.abs().mod(1).round(1) < 0.3 || module.abs().mod(1).round(1) >= 0.8) {
        	return module.round().mul(this.app.config.unitValue);
        }*/

        return module.round(1).mul(this.app.config.unitValue);

    };

    justifyUnitText(val) {
        let module = val.div(this.app.config.unitValue);
        return module.round(0).mul(this.app.config.unitValue);
    }


    /**
     * 绑定svg点击事件
     */
    bindEvent() {

        let that = this;
        let type = '';
        let target = null;
        let isDrag = false;
        let eventData = {
            x: 0,
            y: 0
        };

        this.container[0].addEventListener('mousewheel', scale, false);

        function scale(e) {
            if (!that.app.data.reset) that.app.data.reset = true;
            that._unSelected();
            that.app.func._hideKeyboard();
            if (that.app.data.editPoint) {
                that.app.data.editPoint.belong.showEdit = false;
                that.app.data.editPoint = null;
            }
            let delta = 0;
            let distance = 0;

            if (e.targetTouches) {
                let touch1 = e.targetTouches[0];
                let touch2 = e.targetTouches[1];
                distance = Snap.len(touch1.clientX, touch1.clientY, touch2.clientX, touch2.clientY);
                if (eventData.distance == 0) {
                    eventData.distance = distance;
                }
                delta = distance - eventData.distance;
            } else {
                e.preventDefault();
                delta = e.wheelDelta;
            }

            if (delta < 0) {
                let result = that.app.data.unitLength - 10;
                if (result > that.app.config.minUnitLength) {
                    that.app.data.unitLength = result;
                } else {
                    if (that.app.data.unitLength !== that.app.config.minUnitLength) {
                        that.app.data.unitLength = that.app.config.minUnitLength;
                    }
                }
            } else if (delta > 0) {
                let result = that.app.data.unitLength + 10;
                if (result < that.app.config.maxUnitLength) {
                    that.app.data.unitLength = result;
                } else {
                    if (that.app.data.unitLength !== that.app.config.maxUnitLength) {
                        that.app.data.unitLength = that.app.config.maxUnitLength;
                    }
                }

            }

            eventData.distance = distance;
        }

        function mousedownEvent(e) {

            if (e.targetTouches) {
                if (e.targetTouches.length == 1) {
                    e.preventDefault();
                    e = e.changedTouches[0];
                } else {
                    eventData.distance = 0;
                    type = 'scale';
                }
            } else {
                e.preventDefault();
                if (e.which !== 1) {
                    return
                }
            }

            if (that.app.data.editPoint) {
                that.app.data.editPoint.belong.showEdit = false;
                that.app.data.editPoint = null;
                return
            }

            if (!e.targetTouches) {
                target = Snap(e.target);
                type = target.data('type');
                isDrag = false;
                eventData.startX = e.clientX;
                eventData.startY = e.clientY;
            }

            that.svg.mousemove(mousemoveEvent);
            that.svg.touchmove(mousemoveEvent);
            that.svg.touchcancel(mouseupEvent);
            that.svg.mouseup(mouseupEvent);
            that.svg.touchend(mouseupEvent);

        }

        function mousemoveEvent(e) {

            e.preventDefault();

            if (e.targetTouches && e.targetTouches.length > 1) {
                type = 'scale';
                scale(e);
            } else {

                if (e.changedTouches) {
                    e = e.changedTouches[0];
                }

                eventData.x = e.clientX - eventData.startX;
                eventData.y = e.clientY - eventData.startY;

                if ((Math.abs(eventData.x) > 3 || Math.abs(eventData.y) > 3) && type == 'area') {
                    let result = that.checkCondition(eventData.x);
                    that._unSelected();
                    if (result) {
                        that.app.data.centerValue = result.neg().add(that.app.data.centerValue);
                        if (!that.app.data.reset) that.app.data.reset = true;
                    }

                    isDrag = true;
                    eventData.startX = e.clientX;
                    eventData.startY = e.clientY;
                    that.app.disaggregation.updateDisaggregation();
                }
            }
        }

        function mouseupEvent(e) {
            if (e.touches) {
                if (e.changedTouches) {
                    e = e.changedTouches[0];
                }
            }

            if (!isDrag) {
                if (that.app.data.delete && type != 'point' && type != 'disaggregation') {
                    that._unSelected();
                } else {
                    //添加点
                    if (that.app.data.solutionType == 0 && type == 'area') {
                        let x = eventData.startX - that.transformPosition.x - that.container.offset().left;
                        let val = new Fraction(x).div(that.app.config.unitLength)
                            .mul(that.app.config.unitValue).add(that.app.config.centerValue);
                        if (Point.totalPoint < 10) {
                            if (that.getCurrentRange(val)) {
                                let point = new Point({
                                    index: that.app.config.pointIndex++ % 3,
                                    value: that.justifyPoint(val),
                                    fraction: that.app.config.fraction
                                });
                                that.app.data.pointArr = point;

                                if (!that.app.data.reset) that.app.data.reset = true;
                                that.app.func.setClearStatus();
                            }
                        } else {
                            that.app.func.toolTip.showTooltip(that.app.i18N.i18nData['overten_tip']);
                        }
                    } else if (that.app.data.solutionType == 0 && type == 'point') {
                        let point = target.parent().belong.belong;

                        //这时候如果其他点被选中，则取消
                        if (point !== that.app.data.delete) {
                            that._unSelected();
                        }
                        point.selected = !point.selected;
                        that.app.data.delete = point.selected ? point : false;
                    } else if (type == 'disaggregation') {
                        let group = target.parent();
                        // that.app.func._hideCVKeyboard();
                        if (group.hasClass('active')) {
                            group.removeClass('active');
                            that.app.disaggregation.tag = null;
                            that.app.data.delete = false;
                        } else {
                            that._unSelected();
                            group.addClass('active');
                            that.app.disaggregation.tag = +group.attr('tag');
                            that.app.data.delete = that.app.disaggregation;
                            let type = that.app.config.pointClassArr[that.app.disaggregation.tag];
                            that.app.disaggregation.changeZIndex(type);
                        }
                    } else if (that.app.data.solutionType !== 0 && that.app.data.solutionSet < 3 && type !== 'canvas') {
                        let positionX = eventData.startX - that.transformPosition.x - that.container.offset().left;
                        let value = new Fraction(Math.round(positionX / that.app.config.unitLength * 100) / 100).mul(that.app.config.unitValue).add(that.app.config.centerValue);
                        value = that.justifyPoint(value);
                        if (that.getCurrentRange(value)) {
                            let points = that.app.config.disaggregationPoints,
                                len = points.length;
                            for (let i = 0; i < len; i++) {
                                if (!points[i] || !points[i].isShow) {
                                    points[i].value = value;
                                    points[i].type = that.app.data.solutionType;
                                    points[i].isShow = true;
                                    that.app.disaggregation.changeZIndex(that.app.config.pointClassArr[i]);
                                    break;
                                }
                            }
                            that.app.data.solutionSet += 1;
                            that.app.disaggregation.updateDisaggregation();
                            that.app.data.solutionType = 0;
                            if (!that.app.data.reset) that.app.data.reset = true;
                            that.app.func.setClearStatus();
                        }
                    }
                }
            }

            target = null;
            type = '';
            isDrag = false;
            that.svg.unmousemove();
            that.svg.untouchmove();
            that.svg.untouchcancel();
            that.svg.unmouseup();
            that.svg.untouchend();

        }

        this.svg.mousedown(mousedownEvent);
        this.svg.touchstart(mousedownEvent);

        function fireEvent(el) {
            el.mouseenter(e => {
                Snap.select('.activedPointGroup') ? Snap.select('.activedPointGroup').removeClass('activedPointGroup') : null;
                target = null;
                type = '';
                isDrag = false;
                el.unmousemove();
                el.untouchmove();
                el.untouchcancel();
                el.unmouseup();
                el.untouchend();
                el.unmouseenter();
            });
        }

        this.svg.mouseleave(e => {
            fireEvent(this.svg);

        });

        this.container.on('mouseleave', e => {
            fireEvent(this.svg);
            /*console.log('mouseenter')
            Snap.select('.activedPointGroup') ? Snap.select('.activedPointGroup').removeClass('activedPointGroup') : null;
            target = null;
            type = '';
            isDrag = false;
            this.svg.unmousemove();
            this.svg.untouchmove();
            this.svg.untouchcancel();
            this.svg.unmouseup();
            this.svg.untouchend();*/
        });

        this.menuContainer.on('click', e => {
            let target = $(e.target).closest('.myBtn');
            if (target.length > 0 && !target.hasClass('ui_btn_disabled')) {
                let type = target.data('type');
                that.app.data.delete[type] = !that.app.data.delete[type];
                that.app.data.delete['selected'] = false;
                that.app.data.delete = false;
            }
        });

        this.textBoxContainer.on('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            let rectBox = $(e.target).closest('.rectBox');
            if (rectBox.hasClass('solution')) {
                if (this.app.data.editPoint) {
                    this.app.data.editPoint.belong.showEdit = false;
                    this.app.data.editPoint = null;
                }
                let type = $.trim(rectBox.attr('class').replace(/(solution|rectBox)/ig, ''));
                this.app.disaggregation.changeZIndex(type);
                return;
            };
            this.app.func._hideKeyboard();
            if (this.app.data.editPoint) {
                if (this.app.data.editPoint != rectBox[0].belong) {
                    this.app.data.editPoint.belong.showEdit = false;
                    this.app.data.currPoint = rectBox[0].belong.belong;
                    this.app.data.editPoint = rectBox[0].belong;
                    rectBox[0].belong.linkGroup.changeZIndex();
                    rectBox[0].belong.changeZIndex();
                    this.app.data.currPoint.showEdit = true;
                }
            } else {
                this._unSelected();
                this.app.data.currPoint = rectBox[0].belong.belong;
                this.app.data.editPoint = rectBox[0].belong;
                rectBox[0].belong.linkGroup.changeZIndex();
                rectBox[0].belong.changeZIndex();
                this.app.data.currPoint.showEdit = true;
            }

            // this.app.func.showCVKeyboard(rectBox);
        });

        this.editBtn.on('touchend click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.app.func.showCVKeyboard();
            this.app.data.editPoint.belong.showEdit = false;
            this.app.data.editPoint = null;

        });

    }


    /**
     * 解绑svg上的事件
     */
    unbindEvent() {
        this.canvas.unmousedown();
        this.canvas.untouchstart();

        this.container.off();
        this.menuContainer.off('click');

    }

    /**
     * 改变左右数轴的长度,隐藏不在范围的点或者显示范围内的点
     */
    hidePoints(bool) {
        let leftValue = new Fraction(this.app.config.leftDivision).mul(this.app.config.unitValue).neg().add(this.app.config.jumpOriginPointValue),
            rightValue = new Fraction(this.app.config.rightDivision).mul(this.app.config.unitValue).add(this.app.config.jumpOriginPointValue);
        for (let point of this.app.data.pointArr) {
            point.setPosition();
            if (bool) {
                point.showDistance ? (point.showDistance = false, point.showDistance = true) : null;
            }
            point.disableShowDistance = rightValue.compare(0) < 0 || leftValue.compare(0) > 0;
            point.outside = point.value.compare(rightValue) > 0 || point.value.compare(leftValue) < 0;
            point.shadowOutside = point.value.neg().compare(rightValue) > 0 || point.value.neg().compare(leftValue) < 0;
        }
    }

    /**
     * 取消当前数轴上选中的点或者解集的选中状态
     * @private
     */
    _unSelected() {
        if (this.app.data.delete) {
            if (this.app.data.delete.selected !== undefined) {
                this.app.data.delete.selected = false;
            } else {
                this.app.GraphControl.canvas.select('.active') ? this.app.GraphControl.canvas.select('.active').removeClass('active') : null;
                this.app.disaggregation.tag = null;
            }
            this.app.data.delete = false;
        }
    }
}