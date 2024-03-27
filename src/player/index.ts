class MusicPlayer{
    audio: HTMLAudioElement
    states ={
        currentSong:  {name: '', url: '', image: '', id:'', views:0},
        isPlaying: false,
        volume: 0.5,
        currentPlaylist:  [] as any[],
        currentPlaylistIndex: 0,
        currentPlaylistName: '',
        currentPlaylistId: '',
        autplaynext: true,
        loop: false
    } 


    constructor(){
        this.audio = new Audio()
        this.audio.volume = this.states.volume
        this.audio.addEventListener('ended', () => {
            if(this.states.autplaynext){
               let t = setTimeout(() => {
                this.next()
                clearTimeout(t)
               }, 1000)
            }else{
                this.emit('ended', this.states.currentSong)
            }
        }) 
         
    }

    next = () => {
        let isEnd = false 
        if( this.states.currentPlaylistIndex >= this.states.currentPlaylist.length - 1){
            this.states.currentPlaylistIndex = 0
            isEnd = true
        }
        
        if(!isEnd){ 
            this.states.currentPlaylistIndex++ 
        }
        //  shouldnt skip the last song it should play but only if the
        console.log(this.states.currentPlaylistIndex, this.states.currentPlaylist)
        this.states.currentSong = this.states.currentPlaylist[this.states.currentPlaylistIndex]
        this.setMediaData(this.states.currentPlaylist[this.states.currentPlaylistIndex])
        this.emit('next', this.states.currentPlaylist[this.states.currentPlaylistIndex]) 
        this.play()
    }
    
    emit = (event: string, data: any) => {
        this.audio.dispatchEvent(new CustomEvent(event, {detail: data}))
    }
    on = (event: string, callback: (data: any) => void) => {
        this.audio.addEventListener(event, (ev) => callback(ev))
    }

    setId = (id: string) => {
        this.states.currentPlaylistId = id
    }
    getId = () => {
        return this.states.currentPlaylistId
    }

    setMediaData = (data: any) => {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: data.title,
            artist: data.artist,
            album: data.album || '',
            artwork: [
                {src: data.thumbnail, sizes: '96x96', type: 'image/png'}, 
            ],
        })
        
        this.bindNavigator()
    }
    bindNavigator = () => {
        navigator.mediaSession.setActionHandler('play', () => this.play())
        navigator.mediaSession.setActionHandler('pause', () => this.pause())
        navigator.mediaSession.setActionHandler('previoustrack', () => this.previous())
        navigator.mediaSession.setActionHandler('nexttrack', () => this.next())
    }

    previous = () => {
        this.states.currentPlaylistIndex--
        if(this.states.currentPlaylistIndex < 0){
            this.states.currentPlaylistIndex = this.states.currentPlaylist.length - 1
        }
        this.states.currentSong = this.states.currentPlaylist[this.states.currentPlaylistIndex]
        this.emit('previous', this.states.currentSong )
        this.play()
    }
    pause = () => {
        this.states.isPlaying = false
        this.audio.pause()
        this.emit('pause', this.states.currentSong)
    }
    play = () => {
        this.states.isPlaying = true
        this.states.currentSong = this.states.currentPlaylist[this.states.currentPlaylistIndex]
        this.audio.src = this.states.currentSong.url
        this.audio.play()
        this.emit('play', this.states.currentSong)
        this.setMediaData(this.states.currentSong) 
    }
    setPlaylist = (playlist: any[]) => {
        this.states.currentPlaylist = playlist 
    }

    seek = (time: number) => {
        this.audio.pause()
        this.audio.currentTime = time  
    }
    formatTime = (time: number) => {
        const mins = Math.floor(time / 60)
        const secs = Math.floor(time % 60)
        return `${mins}:${secs < 10 ? '0' + secs : secs}` 
    }
}

const player = new MusicPlayer()
export default player