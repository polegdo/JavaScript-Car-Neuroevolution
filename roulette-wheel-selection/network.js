class NeuralNetwork{
    constructor(neuronCounts){
        this.levels=[];
        if(neuronCounts.length>0){
            for(let i=0;i<neuronCounts.length-1;i++){
                this.levels.push(new Level(
                    neuronCounts[i],neuronCounts[i+1]
                ));
            }
        }
    }

    clone(){
        let networkClone=new NeuralNetwork([]);

        for(let i=0;i<this.levels.length;i++){
            networkClone.levels.push(this.levels[i].clone());
        }

        return networkClone;
    }

    collectWeights(collectedWeights){
        for(let i=0;i<this.levels.length;i++){
            this.levels[i].collectWeights(collectedWeights)
        }
    }

    feedForward(givenInputs){
        let outputs=this.levels[0].feedForward(givenInputs);
        for(let i=1;i<this.levels.length;i++){
            outputs=this.levels[i].feedForward(outputs);
        }
        return outputs;
    }

    mutate(amount=1)
	{
		let rnd=0.0;
        this.levels.forEach(level => {
            for(let i=0;i<level.biases.length;i++){
				rnd=Math.random();
				if(rnd > 0.5)
					rnd=1.0;
				else
					rnd=-1.0;
                level.biases[i]=lerp(
                    level.biases[i],
                    rnd,
                    amount
                )
            }
            for(let i=0;i<level.weights.length;i++){
                for(let j=0;j<level.weights[i].length;j++){
                    rnd=Math.random();
					if(rnd > 0.5)
						rnd=1.0;
					else
						rnd=-1.0;
					level.weights[i][j]=lerp(
                        level.weights[i][j],
                        rnd,
                        amount
                    )
                }
            }
        });
    }

    jaccardIndex(partner){
        let m11=0;
        let m01=0;
        let m10=0;
        let M={
            'M11':m11,
            'M01':m01,
            'M10':m10
        };
        for(let i=0;i<this.levels.length;i++){
            M=this.levels[i].jaccardIndex(partner.levels[i],M);
        }

        let a = M.M11;
        let b = M.M01 + M.M10 + M.M11;

        return a/b;
    }

    recombine(partner){
        let child=new NeuralNetwork([]);

        for(let i=0;i<this.levels.length;i++){
            child.levels.push(this.levels[i].recombine(partner.levels[i]));
        }

        child.mutate(0.1);

        return child;
    }
}

class Level{
    constructor(inputCount,outputCount){
        this.inputs=new Array(inputCount);
        this.outputs=new Array(outputCount);
        this.biases=new Array(outputCount);

        this.weights=[];
        for(let i=0;i<inputCount;i++){
            this.weights[i]=new Array(outputCount);
        }

        Level.#randomize(this);
    }

    clone(){
        let levelClone=new Level(this.inputs.length,this.outputs.length);

        for(let i=0;i<levelClone.inputs.length;i++){
            for(let j=0;j<levelClone.outputs.length;j++){
                levelClone.weights[i][j]=this.weights[i][j];
            }
        }

        for(let i=0;i<levelClone.biases.length;i++){
            levelClone.biases[i]=this.biases[i];
        }

        return levelClone;
    }
    
    static #randomize(level){
        for(let i=0;i<level.inputs.length;i++){
            for(let j=0;j<level.outputs.length;j++){
                level.weights[i][j]=Math.random()*2-1;
            }
        }

        for(let i=0;i<level.biases.length;i++){
            level.biases[i]=Math.random()*2-1;
        }
    }

    feedForward(givenInputs){
        for(let i=0;i<this.inputs.length;i++){
            this.inputs[i]=givenInputs[i];
        }

        for(let i=0;i<this.outputs.length;i++){
            let sum=0
            for(let j=0;j<this.inputs.length;j++){
                sum+=this.inputs[j]*this.weights[j][i];
            }

            if(sum>this.biases[i]){
                this.outputs[i]=1;
            }else{
                this.outputs[i]=0;
            } 
        }

        return this.outputs;
    }

    recombine(partner){
        let child=new Level(this.inputs.length,this.outputs.length);

        //console.log("begin recombine: #inputs=",this.inputs.length," #outputs=",this.outputs.length);

        for(let i=0;i<this.inputs.length;i++){
            for(let j=0;j<this.outputs.length;j++){
                let p1=this.weights[i][j];
                let p2=partner.weights[i][j];
                let a=getRandomArbitrary(-0.25,1.25);
                let c=p1+a*(p2-p1);
                child.weights[i][j]=c;
                //console.log("w1=",p1," w2=",p2);
                //console.log("a=",a," c=",c);
            }
        }

        for(let i=0;i<this.biases.length;i++){
            let p1=this.biases[i];
            let p2=partner.biases[i];
            let a=getRandomArbitrary(-0.25,1.25);
            let c=p1+a*(p2-p1);
            child.biases[i]=c;
            //console.log("b1=",p1," b2=",p2);
            //console.log("a=",a," c=",c);
        }

        return child;
    }

    collectWeights(collectedWeights){
        for(let i=0;i<this.inputs.length;i++){
            for(let j=0;j<this.outputs.length;j++){
                let w=this.weights[i][j];

                collectedWeights.push(w);
            }
        }
    }

    jaccardIndex(partner, givenM){
        let m11 = givenM.M11;
        let m01 = givenM.M01;
        let m10 = givenM.M10;

        for(let i=0;i<this.inputs.length;i++){
            for(let j=0;j<this.outputs.length;j++){
                let p1=this.weights[i][j];
                let p2=partner.weights[i][j];

                let b1 = floatAs64BinaryString(p1);
                let b2 = floatAs64BinaryString(p2);

                for(let k=0;k<b1.length;k++){
                    if(b1[k]=="1" && b2[k]=="1"){
                        m11++;
                    }
                    if(b1[k]=="0" && b2[k]=="1"){
                        m01++;
                    }
                    if(b1[k]=="1" && b2[k]=="0"){
                        m10++;
                    }
                }
            }
        }

        for(let i=0;i<this.biases.length;i++){
            let p1=this.biases[i];
            let p2=partner.biases[i];

            let b1 = floatAs64BinaryString(p1);
            let b2 = floatAs64BinaryString(p2);

            for(let k=0;k<b1.length;k++){
                if(b1[k]=="1" && b2[k]=="1"){
                    m11++;
                }
                if(b1[k]=="0" && b2[k]=="1"){
                    m01++;
                }
                if(b1[k]=="1" && b2[k]=="0"){
                    m10++;
                }
            }
        }

        return {
            'M11':m11,
            'M01':m01,
            'M10':m10
        };
    }
}