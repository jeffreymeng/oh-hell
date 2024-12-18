<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<main class="min-h-screen bg-gray-50">
	<div
		class="relative isolate mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-12 sm:py-16 md:px-16 lg:px-24"
	>
		{@render children()}
	</div>
</main>
