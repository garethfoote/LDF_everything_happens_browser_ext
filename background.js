
'use strict';

const whitelist = [
  "chrome",
  "example.com",
  "localhost",
  "freddystarratemyhamsters.com"
]

const closeInactive = (tabs, senderId) => {
  let lowestId = 999999;
  tabs.forEach((tab) => {
    console.log(tab.id, senderId, lowestId)
    if(tab.id != senderId && tab.id < lowestId){
      lowestId = tab.id
    }
  })

  return browser.tabs.remove(lowestId);
}

const getAll = (activeDomain) => {

  return new Promise((resolve, reject)=>{

    browser.windows.getAll({populate:true})
      .then((windows)=>{

        let tabs = []
        windows.forEach(function(window){
          window.tabs.forEach(function(tab){
            const tabDomain = domainFrom(tab.url)
            // console.log(tabDomain, whitelist.includes(tabDomain))
            if(whitelist.includes(tabDomain) === true){
              if(tabDomain === activeDomain) 
                tabs.push(tab)
            } else {
              chrome.tabs.remove(tab.id, function() { });
            }
          }) 
        })
        // console.log(tabs)
        resolve(tabs)
      })
  })

}

const domainFrom = (url) => {
  var result
  var match
  if (match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im)) {
      result = match[1]
      if (match = result.match(/^[^\.]+\.(.+\..+)$/)) {
          result = match[1]
      }
  }
  return result
}

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    const domain = domainFrom(sender.url)
    console.log(request, domain)
    if(whitelist.includes(domain) === true && request.type === "open"){
      
      getAll(domain)
        .then((tabs)=>{
          if(tabs.length > 3){
            // console.log("closing one", tabs)
            return closeInactive(tabs, sender.tab.id)
            sendResponse('success')
          }
         
        }).then(()=>{
          // If we want to open a new one from the extension.
        })
    }
    
  });
