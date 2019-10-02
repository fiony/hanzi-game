chrome.browserAction.onClicked.addListener(function(activeTab)
{
    var newURL = "poem.html";
    chrome.tabs.create({ url: newURL });
});