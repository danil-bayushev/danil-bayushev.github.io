window.onload = function(){
    let str = "";
    let files = [];
    let fileO = document.querySelector("#file");
    let startBtn = document.querySelector(".startBtn");
    startBtn.addEventListener('click', showFileInput);
    fileO.addEventListener('change', processFile);
    let resultObj = {};



    function showFileInput(){
        fileO.click();
    }

    function processFile(){
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            if(!(files.includes(file.name, 0))){
                str += e.target.result;
                files.push(file.name);
            }else{
                alert(`Файл ${file.name} был внесен в таблицу ранее`);
            }
            
           start();
        };
        reader.readAsText(file);
    }

    function start(){
        let TIKS = strToObj(str, Tik);
        calcFuelRate(TIKS);
    }

    function strToObj(string, classObj){
        let Obj = [];
        let arr = string.split('\n');
        arr.splice(0, (arr.indexOf("Send:\t2101"))-1);
        let arrClear = [];
        for(let i=0; i < arr.length; i++){
            let o = {};
            if(arr[i].split(':\t')[0] == "Time"){
                o.time = arr[i].split(':\t')[1];
                if(arr[i+2].length == 138 && arr[i+5].length == 264)
                {
                    o.data = (arr[i+2].split(': ')[1]+arr[i+5].split(': ')[1]).split(" ");
                    arrClear.push(o);
                    i+=5;
                }
            }
        }

        arrClear.forEach((el) => {
                let tempTime = el.time.split(',')[0];
                let time = +(tempTime.split(':')[2])+tempTime.split(':')[1]*60+tempTime.split(':')[0]*3600;
                    od = hexToDec(el.data[18]+el.data[19]),
                    pdz = hexToDec(el.data[20]+el.data[21])/10,
                    uoz = hexToDec(el.data[22]+el.data[23])/10,
                    div = hexToDec(el.data[24]+el.data[25])/100,
                    dav = hexToDec(el.data[28]+el.data[29]),
                    toz = hexToDec(el.data[30])-40,
                    tv = hexToDec(el.data[31])-40,
                    crt = hexToDec(el.data[32]+el.data[33])/100,
                    prt = hexToDec(el.data[34]+el.data[35])/10,
                    spd = hexToDec(el.data[36]),
                    nbs = hexToDec(el.data[37])/10,
                    rhh = hexToDec(el.data[39]),
                    dk = round(hexToDec(el.data[41])*0.0048828125),
                    vniz = hexToDec(el.data[42])/10,
                    ktpdk = round(hexToDec(el.data[61]+el.data[62])/10000),
                    zprhh = hexToDec(el.data[76]),
                    sktpdk = round(hexToDec(el.data[77]+el.data[78])/10000),
                    ndet = round(hexToDec(el.data[89]+el.data[90])*0.0048828125),
                    johh = hexToDec(el.data[91]+el.data[92]);
                Obj.push(new classObj(od,pdz,uoz,div,dav,toz,tv,crt,prt,spd,nbs,rhh,dk,vniz,ktpdk,zprhh,sktpdk,ndet,johh,time));
        });
    
        return Obj;
    }

    function calcFuelRate(arr){
        const spf = 0.0016; //статическая производительность форсунки (гр/мс)
        const pF = 98; //статическая производительность форсунка (г/мин)
        const tF = 4; // вермя открытия форсунки
        let timeXX=0,
            frXX = 0,
            rtArr=[],
            fr = 0,
            frSum = 0;
        for(let i=0; i<arr.length; i++){
            if(arr[i].pdz == 0){
                let tStartXX = arr[i].time;
                while(arr[i].pdz == 0){
                    if((i+1)<arr.length){
                        i++;
                    }else{
                        i=arr.length-1;
                        break;
                    };
                }
                let tEndXX = arr[i].time;
                timeXX += tEndXX-tStartXX;
            }else{
                let mrt = (((arr[i].div*2)/60000)*98*arr[i].od*60)/1000;//моментальный расход топлива(л/ч)
                
                let spd =  (arr[i].spd == 0) ? 1 : arr[i].spd;
                let rt100km4 = mrt * (100/spd); //моментальный расход топлива(л/100км)
                rtArr.push(rt100km4);
            }
        }
        frXX = Math.round((((((4*2)/60000)*pF*950)/60)/1000 * timeXX)*100)/100; //Израсходовано на холостых за лог (л/ч) 
        fr = rtArr.reduce((sum, cur)=>{ //средний расход топлива (л/100км)
                        return sum + cur; 
                    })/rtArr.length;
        frSum = Math.round((fr+frXX)*100)/100;



        const rashod = document.querySelector('.l100km4');
        const izrXX = document.querySelector('.rXX');

        rashod.innerHTML = frSum;
        izrXX.innerHTML = frXX;
    }




    function hexToDec(hex){ return parseInt(hex,16); }

    function round(e){
        return (Math.round(e*100))/100;
    }

    //----------------------------------------------------------

    class Tik{
        constructor(...args){
            this.od = args[0];
            this.pdz = args[1];
            this.uoz = args[2];
            this.div = args[3];
            this.dav = args[4];
            this.toz = args[5];
            this.tv = args[6];
            this.crt = args[7];
            this.prt = args[8]
            this.spd = args[9];
            this.nbs = args[10];
            this.rhh = args[11];
            this.dk = args[12];
            this.vniz = args[13];
    
            this.ktpdk = args[14];
            this.zprhh = args[15];
            this.sktpdk = args[16];
            this.ndet = args[17];
            this.johh = args[18];
            this.time = args[19];
        }
    }

}
