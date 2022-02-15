import { HTTPRequest as Request } from 'puppeteer';
import { PageContext } from '../types';
import { CollectMeta } from '../types/audit';
import { PrivateSettings } from '../types/settings';
import { CollectLazyMediaTraces } from '../types/traces';
import * as util from '../utils/utils';
import Collect from './collect';

export default class CollectLazyMedia extends Collect {
	static get meta() {
		return {
			id: 'lazymediacollect',
			passContext: 'networkidle0',
			debug: util.debugGenerator('Lazy media collect')
		} as CollectMeta;
	}

	static async collect(
		pageContext: PageContext,
		settings: PrivateSettings
	): Promise<CollectLazyMediaTraces | undefined> {
		const { page } = pageContext;
		try {
			const debug = CollectLazyMedia.meta.debug;
			await util.safeNavigateTimeout(
				page,
				'networkidle0',
				settings.maxNavigationTime,
				debug
			);

			const isPageScrollable = await util.isPageAbleToScroll(page)
			if (!isPageScrollable) {
				throw new Error('Page is unable to scroll');
			}

			const lazyImages: string[] = [];
			const lazyVideos: string[] = [];
			(function () {
				page.on('requestfinished', (request: Request) => {
					if (request.resourceType() === 'image') {
						lazyImages.push(request.url());
					}

					if (request.resourceType() === 'media') {
						lazyVideos.push(request.url());
					}
				});
			})()

			await util.scrollFunction(page, settings.maxScrollInterval, debug)
			
			debug('done');

			return {
				lazyMedia: {
					lazyImages,
					lazyVideos
				}
			};
		} catch (error) {
			util.log(`Error: Lazy Media collect failed with message: ${error}`);
			return undefined;
		}
		finally{
			page.removeAllListeners('requestfinished')
			page.emit('scrollFinished')
		}
	}
}
