import { Component,ViewChild,OnInit, ElementRef } from '@angular/core';
import { Observable, Subscriber, range, fromEvent, BehaviorSubject, interval, timer, combineLatest, of, generate, Subject, merge } from "rxjs";
import { map,startWith, switchMap, scan, takeWhile, tap, concatMap, delay, bufferCount, takeUntil } from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent  implements OnInit{
  title = 'rxjs-typingtest-ex';

  @ViewChild('typebox')
  typebox:ElementRef;

  @ViewChild('wpm')
  wpmbox:ElementRef;


  speedwpm=0;

  //method to generate random char with 3 levels

  generateStr(length:number,level?:number):string{
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@., "%_-';
    switch(level){
      case 1:{
        var characters = 'abcdefghijklmnopqrstuvwxyz 0123456789';
        break;
      }
      case 2:{
        var characters = 'ABCDEFKLMNOPRSTUabcdefghijklmnopqrstuvwxyz 0123456789';
        break;
      }
    }
    
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  } // end

  ngOnInit(){

  }


  //observable of 1 minute timing

  arrgiven:string[] = [];
  arrtyped:String[] = [];

  timestr:string = '1:00';
  secondscount = 60;

  timestr$ = timer(1000, 1000)
  .pipe(
    takeWhile( () => this.secondscount > 0),
    tap(() => this.secondscount--),
    map(x=> {
      if(this.secondscount<10)
        this.timestr = '0:0'+this.secondscount;
      else
        this.timestr = '0:'+this.secondscount;
    })
  ); // end of observable

  // observable: pushing random generated data in html

  chargenerated:string;
  stoptyping$ = timer(60*1000);

  givenstr$ = timer(500,500).pipe(takeUntil(this.stoptyping$),
  map(x => {
    if(this.correct>12 && this.correct<20)
      this.chargenerated = this.generateStr(1,2);
    else if(this.correct>20)
      this.chargenerated = this.generateStr(1);
    else
      this.chargenerated = this.generateStr(1,1);
    this.typebox.nativeElement.innerHTML += this.chargenerated,
    this.arrgiven.push(this.chargenerated);
  })
  ); // end of observable



  keyip;
  loopi=0;

  correct = 0;
  incorrect = 0;

  // observable:  to handle typed char

  typedstr$ = fromEvent(document, 'keydown')
  .pipe(
    takeUntil(this.stoptyping$),
    map((e: KeyboardEvent) =>{ 
      this.keyip = e.key;
      this.arrtyped.push(this.keyip);
      //console.log(this.keyip);
      //console.log('typed',this.keyip);
      //console.log(this.arrgiven[this.loopi]);
      
      if(this.keyip === this.arrgiven[this.loopi])
      {
        this.loopi++;
        this.correct++;
      }
      else
      {
        this.loopi++;
        this.incorrect++;
      }
  })); //end of observable

  netspeedwpm=0;

  // method to count typing speed

  countspeed()
  {
    this.speedwpm = Math.floor((this.correct+this.incorrect)/5);
    this.netspeedwpm = this.speedwpm - Math.ceil(this.incorrect/5);
    if(this.netspeedwpm<0)
      this.netspeedwpm = 0;
  } //end 

  // handle start btn click event
  startTyping(event)
  {
    let btn = document.querySelector('button');
    btn.disabled = true;
    this.wpmbox.nativeElement.innerHTML = 'Typing...';
    let mergedthree = merge(this.timestr$,this.typedstr$,this.givenstr$);
    mergedthree.subscribe({
        next:()=>{},
        error:err=>console.log('error',err),
        complete:()=> {
          console.log('Time over');
          console.log('char given',this.arrgiven);
          console.log('char typed',this.arrtyped);
          console.log('correct',this.correct);
          console.log('incorrect',this.incorrect);
          this.countspeed();
          this.wpmbox.nativeElement.innerHTML = this.netspeedwpm + ' wpm';
          btn.disabled = false;
        },
      });

  }//end

  //reset btn click event handler
  refresh(e)
  {
    document.location.reload();
  }

}//class end
