const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road=new Road(carCanvas.width/2,carCanvas.width*0.9);

const N=100;
let cars=generateCars(N);
let bestCar=cars[0];
let bestFitness=1000;
let lastBestFitness=1000;
let bestCarSaved=false;
let restartRequest=false;
let burstMutationRequest=false;
let burstMutationN=0;
let startNewExperimentRequest=false;
let restartCountdown=100;
var bestBrain;
let matingPool=[];
let matingPoolFrequencies=new Map();
let iterationN=1;
let stagnationCountdown=5;
let experimentN=1;
let experimentAvgBestFitnessDistance=0;
let date=new Date();
let time=date.toTimeString();

const traffic=[
    new Car(road.getLaneCenter(1),100,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(0),300,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(2),300,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(0),500,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(1),500,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(1),700,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(2),700,30,50,"DUMMY",2,getRandomColor()),
];

for(let i=0;i<cars.length;i++){
    cars[i].fitness=cars[i].y-traffic[0].y;
}

console.log("эксперимент #", experimentN, " ", time);

animate();

function save(){
    bestBrain=bestCar.brain.clone();
}

function generateCars(N){
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(1),1000,30,50,"AI"));
    }
    return cars;
}

function animate(time){
	if(startNewExperimentRequest){
		startNewExperiment();
	}
    if(restartRequest){
        restart();
    }
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic);
        if(cars[i].damaged==false){
            cars[i].fitness=cars[i].y-traffic[0].y;
        }
    }
    bestCar=cars.find(
        c=>c.fitness==Math.min(
            ...cars.map(c=>c.fitness)
        ));

    if(bestCar.fitness<-800){
	startNewExperimentRequest=true;
    }

    if(bestCar.fitness < bestFitness)
	{
        bestFitness=bestCar.fitness;
		if(iterationN == 1)
		{
			lastBestFitness = bestFitness;
		}
    }
    else
	{
        restartCountdown--;
        if(restartCountdown<=0)
		{
			restartRequest=true;
			if(bestFitness >= lastBestFitness)
			{
				stagnationCountdown--;
			}
			else if(bestFitness < lastBestFitness)
			{
				lastBestFitness = bestFitness;
			}
			console.log("отсчет до обнаружения стагнации:", stagnationCountdown);
            if(!bestCarSaved)
			{
                save();
                bestCarSaved=true;
            }
        }
    }

    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx);
    }
    carCtx.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,true);

    carCtx.restore();

    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
}

function startNewExperiment()
{
	console.log("завершение эксперимента");
	console.log("выполнено итераций:",iterationN," обнаружено стагнаций:", burstMutationN);
	cars=[];
	cars=generateCars(N);
	bestCar=cars[0];
	bestFitness=1000;
	bestCarSaved=false;
	startNewExperimentRequest=false;
	restartRequest=false;
	restartCountdown=100;

	lastBestFitness=1000;
	burstMutationRequest=false;
	burstMutationN=0;
	stagnationCountdown=5;	
	
	matingPool=[];

	experimentN++;
	iterationN=1;
	
	date=new Date();
	time=date.toTimeString();
	console.log("эксперимент #", experimentN, " ", time);
	
	for(let i=0;i<cars.length;i++){
        cars[i].fitness=cars[i].y-traffic[0].y;
    }

    traffic[0].y=100;
    traffic[1].y=300;
    traffic[2].y=300;
    traffic[3].y=500;
    traffic[4].y=500;
    traffic[5].y=700;
    traffic[6].y=700;
}

function burstMutate()
{
	cars=[];
	cars=generateCars(N);

	for(let i=0; i<cars.length; i++)
	{
		cars[i].brain=bestBrain.clone();
		cars[i].brain.mutate();	
	}

	cars[0].brain=bestBrain.clone();

    bestCar=cars[0];
    bestFitness=1000;
    bestCarSaved=false;
    restartRequest=false;
	burstMutationRequest=false;
    restartCountdown=100;

    for(let i=0;i<cars.length;i++){
        cars[i].fitness=cars[i].y-traffic[0].y;
    }

    traffic[0].y=100;
    traffic[1].y=300;
    traffic[2].y=300;
    traffic[3].y=500;
    traffic[4].y=500;
    traffic[5].y=700;
    traffic[6].y=700;

    iterationN++;
}

function restart()
{
	if(stagnationCountdown <= 0)
	{
		burstMutationRequest=true;
		burstMutationN++;
		stagnationCountdown = 5;
		console.log("стагнация обнаружена на итерации #", iterationN);
	}

	if(burstMutationRequest)
	{
		burstMutate();
		burstMutationRequest = false;
	}
	else
	{
		matingPool=[];
		for(let i=0;i<cars.length;i++){
			let tournamentWinner=getTournamentWinner(80);
			matingPool.push(tournamentWinner);
		}
		
		cars=[];
		let n=0;
		for(let i=0; i<matingPool.length/2; i++)
		{
			let childA=new Car(road.getLaneCenter(1),1000,30,50,"AI");
			let childB=new Car(road.getLaneCenter(1),1000,30,50,"AI");
		
			childA.brain=matingPool[n].brain.recombine(matingPool[n+1].brain);
			childB.brain=matingPool[n+1].brain.recombine(matingPool[n].brain);
			cars.push(childA);
			cars.push(childB);
			n+=2;
		}
		
		bestCar=cars[0];
		bestFitness=1000;
		bestCarSaved=false;
		restartRequest=false;
		restartCountdown=100;

		for(let i=0;i<cars.length;i++){
			cars[i].fitness=cars[i].y-traffic[0].y;
		}

		traffic[0].y=100;
		traffic[1].y=300;
		traffic[2].y=300;
		traffic[3].y=500;
		traffic[4].y=500;
		traffic[5].y=700;
		traffic[6].y=700;

		iterationN++;
    }
}

function getTournamentWinner(size)
{
    let tournament=[];
    
    for(let i=0;i<size;i++){
        let n=getRandomIntInclusive(0,cars.length-1);
        tournament.push(cars[n]);
    }

    let tournamentWinner=tournament.find(
        c=>c.fitness==Math.min(
            ...tournament.map(c=>c.fitness)
        ));

    return tournamentWinner;
}