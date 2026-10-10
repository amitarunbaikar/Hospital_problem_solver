/* Runs in <head> before first paint so the saved theme applies with no flash */
try{document.documentElement.dataset.theme=localStorage.getItem("mf_theme")||"dark"}catch(e){}
