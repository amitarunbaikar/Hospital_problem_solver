/* Moves the glass "touch glow" to wherever the pointer is on a button. */
(function(){var q=0;function move(e){var b=e.target&&e.target.closest&&e.target.closest('button');if(!b)return;var x=e.clientX,y=e.clientY;if(q)cancelAnimationFrame(q);q=requestAnimationFrame(function(){var r=b.getBoundingClientRect();b.style.setProperty('--bx',(x-r.left)+'px');b.style.setProperty('--by',(y-r.top)+'px')})}
document.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerdown',move,{passive:true})})();
