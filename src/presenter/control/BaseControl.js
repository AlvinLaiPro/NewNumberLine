import AppConfig from "../model/AppConfig";
let Fraction = require('fraction.js');
/**
 * 控制器基类
 *
 * @author Tiago
 */
class BaseControl {
	/**
	 * 构造
	 */
	constructor() {
	}

	/**
	 * 根据事件类型，获取目标
	 * 主要是为了pad兼容
	 */
	_getRealEvent( event, stopPop = true ) {
		stopPop && event.stopPropagation;
		if ( event.targetTouches && event.targetTouches.length ) return event.targetTouches[ 0 ];
		if ( event.changedTouches && event.changedTouches.length ) return event.changedTouches[ 0 ];
		return event;
	}

	/**
	 * 打印调用堆栈
	 */
	__( ...args ) {
		console.log( this );
		throw new Error( '《调用堆栈》' );
	}

	/**
	 * 判断当前的点是否在显示的数轴范围内
	 * @param val 当前的值
	 * @param config 当前的config对象
	 * @param overThousand 是否允许超过1000，在点移动时，不可以超过1000
	 */
	_isWithScope(val, config, overThousand = true) {
		let rightValue =  new Fraction(config.rightDivision).mul(config.unitValue).add(config.jumpOriginPointValue),
			leftVlaue = new Fraction(config.leftDivision).mul(config.unitValue).neg().add(config.jumpOriginPointValue);
		if (rightValue.compare(val) < 0 || leftVlaue.compare(val) > 0) {
			return null;
		}
		if(!overThousand) {
			return new Fraction(val).compare(1000) <= 0;
		}
		return val;
	}

}

export default BaseControl;