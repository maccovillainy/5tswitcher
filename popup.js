function createTable(config) {
	chrome.extension.getBackgroundPage().console.log('config', config);
	var table = '';
	if (config && config.groups) {
		config.groups.forEach(group => {
			let hasNewLink = false;

			group.hosts.forEach(host => {
				if (host.justOpen) {
					hasNewLink = true;
				}
			});

			table += `
				<div class="container">
					<h2>${group.title}</h2>
					<table>
						<thead>
							<tr>
								<th>ТЕКУЩАЯ</th>`;

			if (hasNewLink) {
				table += `<th>ССЫЛКА</th>`;
			}

			table += `</tr></thead><tbody>`;

			group.hosts.forEach(host => {

				table += `
						<tr>
							<td class="js-host" data-type=${host.host}>${host.name}</td>
				`;

				if (host.justOpen) {
					console.log('group.site', group.site);
					if (group.site) {
						table += `
						<td>
							<div class="link">
								<a class="js-link link" href=https://${host.host} >${host.name}</a>
								<ul class="dropdown">
									<li>
										<a class="js-link" href=https://${host.host}/anapa>Anapa</a>
									</li>
									<li>
										<a class="js-link" href=https://${host.host}/anapa/stay>Anapa stay</a>
									</li>
								</ul>
							</div>
						</td>`;
					} else {
						table += `
						<td>
							<a class="js-link" href=https://${host.host} />${host.name}</a>
						</td>`;
					}
				}

				table += '</tr>';
			});
			table += '</tbody></table></div>';
		})
	}
	return table;
}

switcher.innerHTML = createTable(window.config);

var buttons = document.querySelectorAll('#switcher .js-host');
Array.prototype.forEach.call(buttons, button => {
	button.addEventListener('mousedown', function (e) {
		chrome.extension.getBackgroundPage().console.log('click')
		const button = this;
		let host = button.dataset.type;

		chrome.tabs.query(
			{
				currentWindow: true,    // currently focused window
				active: true            // selected tab
			},
			function (foundTabs) {
				if (foundTabs.length > 0) {
					const url = foundTabs[0].url;
					const parsedUrl = getLocation(url);
					const fullUrl = parsedUrl.href.replace(parsedUrl.hostname, host);

					if (e.shiftKey && e.button === 2) { //rkm
						chrome.windows.create({url: fullUrl + (parsedUrl.href.indexOf('\?') !== -1 ? '&ONLY_CRITICAL_STYLES=1/' : '?ONLY_CRITICAL_STYLES=1/'), "incognito": true});
					} else if (e.shiftKey && e.button === 1) { //lkm
						chrome.cookies.remove({
							url,
							name: "version"
						});
						chrome.tabs.create({url: fullUrl + (parsedUrl.href.indexOf('ONLY_CRITICAL_STYLES=1') !== -1 ? '' : '?ONLY_CRITICAL_STYLES=1/')});
					} else if (e.shiftKey && e.button === 0) { //w
						chrome.cookies.remove({
							url,
							name: "version"
						});
						chrome.tabs.update({url: fullUrl + (parsedUrl.href.indexOf('ONLY_CRITICAL_STYLES=1') !== -1 ? '' : '?ONLY_CRITICAL_STYLES=1/')});
					} else if (e.button === 2) {
						chrome.windows.create({url: fullUrl, "incognito": true});
					} else if (e.button === 1) {
						chrome.tabs.create({url: fullUrl});
					} else if (e.button === 0) {
						chrome.tabs.update({url: fullUrl});
					}


				}
			}
		);
	});
});

var links = document.querySelectorAll('#switcher .js-link');
Array.prototype.forEach.call(links, button => {
	button.addEventListener('mousedown', function (e) {
		const link = this;
		const url = link.href;
		chrome.tabs.query(
			{
				currentWindow: true,    // currently focused window
				active: true            // selected tab
			},
			function (foundTabs) {
				if (foundTabs.length > 0) {
					 if (e.button === 1) {
						chrome.tabs.create({url});
					} else if (e.button === 0) {
						chrome.tabs.update({url});
					}


				}
			}
		);
	});
});


let lastEl = null;

const updateCurrent = () => {
	chrome.tabs.query(
		{
			currentWindow: true,    // currently focused window
			active: true            // selected tab
		},
		function (foundTabs) {
			if (foundTabs.length > 0) {
				if (lastEl) {
					lastEl.classList.remove('current');
				}
				const url = foundTabs[0].url;
				const host = getLocation(url).host;
				let elem = document.querySelector(`[data-type="${host}"]`);
				if (elem) {
					while (elem.tagName.toLowerCase() !== 'table') {
						elem = elem.parentNode;
					}
					elem.classList.add('current');
					lastEl = elem;
				}

			}
		}
	)};

updateCurrent();

setInterval(updateCurrent, 3000);


function getLocation(href) {
	var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
	return match && {
		href: href,
		protocol: match[1],
		host: match[2],
		hostname: match[3],
		port: match[4],
		pathname: match[5],
		search: match[6],
		hash: match[7]
	}
}

