document.addEventListener('DOMContentLoaded',function(){
    console.log('Whole app js called')
    // prevent a tags default
    document.querySelectorAll('a').forEach((a_tag)=>{
        // console.log(a_tag)
        let attr = a_tag.getAttribute('href');
        // console.log('ATTR@',attr)
        if(attr && typeof attr == 'string' &&  attr.includes('#status')){
            //  console.log('FOUND@',attr)

            a_tag.addEventListener('click',(e)=>{
                // console.log('Atag',a_tag)
                e.preventDefault() 
                document.getElementById(attr.replace('#',''))
                        .classList.add('active')
            })
        
       
        }
         
        
    })
})