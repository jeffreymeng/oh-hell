<script lang="ts">
	let lockEnabled = $state(false);
	let initialized = $state(false);
	let wakeLock: WakeLockSentinel | null = $state(null);

	const WAKE_LOCK_ENABLED_LOCALSTORAGE_KEY = 'wakeLockEnabled';

	$effect(() => {
		if (!initialized) {
			if (localStorage.getItem(WAKE_LOCK_ENABLED_LOCALSTORAGE_KEY) == 'yes') {
				lockEnabled = true;
			}
			initialized = true;
		}
	});

	async function requestWakeLock() {
		wakeLock = await navigator.wakeLock.request('screen');
		wakeLock.addEventListener('release', async () => {
			console.log('lock released');
			wakeLock = null;
		});
		console.log('lock acquired');
	}

	$effect(() => {
		(async () => {
			if (!initialized) return;

			if (lockEnabled) {
				try {
					await requestWakeLock();
					localStorage.setItem(WAKE_LOCK_ENABLED_LOCALSTORAGE_KEY, 'yes');
				} catch (e) {
					alert('Failed to enable screen wake lock: ' + e);
					console.error(e);

					lockEnabled = false;
					localStorage.setItem(WAKE_LOCK_ENABLED_LOCALSTORAGE_KEY, 'no');
				}
			} else {
				localStorage.setItem(WAKE_LOCK_ENABLED_LOCALSTORAGE_KEY, 'no');
				wakeLock?.release();
			}
		})();
	});

	$effect(() => {
		const handleVisibilityChange = async () => {
			if (
				lockEnabled &&
				(!wakeLock || wakeLock.released) &&
				document.visibilityState === 'visible'
			) {
				requestWakeLock();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
	});
</script>

<div class="flex items-center pt-8">
	<button
		type="button"
		class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
		class:bg-indigo-600={lockEnabled}
		class:bg-gray-200={!lockEnabled}
		role="switch"
		aria-checked="false"
		aria-labelledby="annual-billing-label"
		onclick={() => (lockEnabled = !lockEnabled)}
	>
		<span
			aria-hidden="true"
			class="pointer-events-none inline-block size-5 translate-x-0 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
			class:translate-x-5={lockEnabled}
			class:translate-x-0={!lockEnabled}
		></span>
	</button>
	<span class="ml-3 text-sm" id="annual-billing-label">
		<!-- <span class="font-medium text-gray-900">Annual billing</span> -->
		<span class="text-gray-500">Prevent screen from sleeping</span>
	</span>
</div>
