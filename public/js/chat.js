const socket = io()

//Elements
const $messageForm = document.querySelector('#message')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocation = document.querySelector('#Locate')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //Height of the last message with margins
    const newMessageStyles =getComputedStyle($newMessage)
    const newMsgMargin = parseInt(newMessageStyles.marginBottom)
    const newMsgHeight = $newMessage.offsetHeight +newMsgMargin

    //visible Height
    const visibleHeight = $newMessage.offsetHeight

    //height of msg container
    const containerHeight = $messages.scrollHeight

    //How far i scrooled
    const scrollOffset = $messages.scrollTop +visibleHeight

    if(containerHeight - newMsgHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage',(url)=>{
    console.log(url)
    const uhtml = Mustache.render(locationTemplate,{
        username:url.username,
        url:url.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', uhtml)
    autoscroll()
})

socket.on('roomData',({room, users})=> {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.msg.value
    // document.querySelector('input').value

    socket.emit('sendMessage',message,(msg)=>{
        
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(msg){
            return console.log(msg)
        }
        
        console.log(msg)
    })
})

$sendLocation.addEventListener('click' , ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported in your browser.')
    }
    $sendLocation.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{latitude:position.coords.latitude,longtitude:position.coords.longitude},()=>{
            $sendLocation.removeAttribute('disabled')
            console.log('Location Shared to your room')
        })
    })

})

socket.emit('join' ,{username,room}, (error)=> {
    if(error){
        alert(error)
        location.href = '/'
    }
})