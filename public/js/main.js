$('form').on('submit', (e)=>{
    e.preventDefault();

    const name = $('name').val().trim()
    const email = $('#email').val().trim();
    const subject = $('#subject').val().trim()
    const text = $('#text').val().trim()

    const data = {
        name,
        email,
        subject,
        text
    }
    $.post('/contact', data, function(){
        console.log('server received our data')
    })
})