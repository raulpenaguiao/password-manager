clickableHTML = document.querySelectorAll(".clickable");

clickableHTML.forEach(item =>{
    item.addEventListener('click', ()=>{
        item.children[0].checked = !item.children[0].checked;
    })
})