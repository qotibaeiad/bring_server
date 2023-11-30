class Getdata {
    constructor(request){
        if (Getdata.instance) {
            return Getdata.instance;
        }
        Getdata.instance=this;
        this.request= request;
        return this;
    }
    getdata(){
        return{
            request:this.request
        };
    }

    processData() {
        // Perform some action on this.request
        console.log('Processing data:', this.request);
    }
}