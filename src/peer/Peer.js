class Peer {
    constructor (){
        if(!this.peer){
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.services.mozilla.com",
                            "stun:stun.stunprotocol.org:3478"
                        ],
                        username: "@global_arbind.tcp.twillo.com",
                        credential: "$twillo.com?port=4747"
                    }
                ]
            })
        }
    }
    
    async getOffer(){
        if(this.peer){
            const offer = await this.peer.createOffer(); 
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
    }
    disconnect(){
        if(this.peer){
            this.peer.close();
            this.peer = null;
        }
    }
    async connectRemoteOffer(offer){
        if(this.peer ){
            await this.peer.setRemoteDescription(offer);
            const answer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(answer));
            return answer;
        }
    }
    async setRemoteDescription(ans){
        if(this.peer){
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        }
    }
}

export default Peer;