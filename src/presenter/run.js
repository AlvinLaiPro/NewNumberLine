/**
 * 运行环境下, 初始化Module的方法
 * @param view 运行视图(DOM对象)
 * @param model Module的模型, Key-Value结构
 * @remark 该方法为Module生命周期方法,仅在Module初始化时执行一次
 */
import AppControl from './control/AppControl'
import css from '../css.scss'

export default function (view)
{
	AppControl.getInst().init(view);
	console.log('run')
}
