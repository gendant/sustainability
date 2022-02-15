import { PageContext } from '../types';
import { CollectMeta } from '../types/audit';
import { PrivateSettings } from '../types/settings';
import { CollectPerformanceTraces, Metrics } from '../types/traces';
import * as util from '../utils/utils';
import Collect from './collect';

export default class CollectPerformance extends Collect {
	static get meta() {
		return {
			id: 'performancecollect',
			debug: util.debugGenerator('Performance collect')
		} as CollectMeta;
	}

	static async collect(
		pageContext: PageContext,
		settings: PrivateSettings
	): Promise<CollectPerformanceTraces> {
		const { page } = pageContext;
		const debug = CollectPerformance.meta.debug;
		debug('running');
		await util.safeNavigateTimeout(page, 'load', settings.maxNavigationTime);
		const perf: Performance = await page.evaluate(() => performance.toJSON()) as Performance
		const metrics: Metrics = await page.metrics();
		const info = {
			perf,
			metrics
		};
		debug('done');
		return {
			performance: info
		};
	}
}
