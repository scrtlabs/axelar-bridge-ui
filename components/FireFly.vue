<template>
  <div>
    <div class="firefly"  v-for="n in 15" :key="'firefly' + n"></div>
  </div>
</template>

<style>
.firefly {
  position: fixed;
  left: 50%;
  top: 50%;
  width: 0.4vw;
  height: 0.4vw;
  margin: -0.2vw 0 0 9.8vw;
  animation: ease 200s alternate infinite;
  pointer-events: none;
}
.firefly::before, .firefly::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transform-origin: -10vw;
}
.firefly::before {
  background: black;
  opacity: 0.4;
  animation: drift ease alternate infinite;
}
.firefly::after {
  background: white;
  opacity: 0;
  box-shadow: 0 0 0vw 0vw yellow;
  animation: drift ease alternate infinite, flash ease infinite;
}

.firefly:nth-child(1) {
  animation-name: move1;
}
.firefly:nth-child(1)::before {
  animation-duration: 15s;
}
.firefly:nth-child(1)::after {
  animation-duration: 15s, 8755ms;
  animation-delay: 0ms, 2086ms;
}

@keyframes move1 {
  0% {
    transform: translateX(35vw) translateY(9vh) scale(0.62);
  }
  4.1666666667% {
    transform: translateX(-34vw) translateY(-44vh) scale(1);
  }
  8.3333333333% {
    transform: translateX(-14vw) translateY(48vh) scale(0.3);
  }
  12.5% {
    transform: translateX(-9vw) translateY(39vh) scale(0.62);
  }
  16.6666666667% {
    transform: translateX(50vw) translateY(33vh) scale(0.37);
  }
  20.8333333333% {
    transform: translateX(7vw) translateY(-35vh) scale(0.96);
  }
  25% {
    transform: translateX(-10vw) translateY(9vh) scale(0.66);
  }
  29.1666666667% {
    transform: translateX(-26vw) translateY(10vh) scale(0.99);
  }
  33.3333333333% {
    transform: translateX(38vw) translateY(8vh) scale(0.94);
  }
  37.5% {
    transform: translateX(25vw) translateY(-11vh) scale(0.3);
  }
  41.6666666667% {
    transform: translateX(-25vw) translateY(-34vh) scale(0.57);
  }
  45.8333333333% {
    transform: translateX(-41vw) translateY(10vh) scale(0.47);
  }
  50% {
    transform: translateX(25vw) translateY(-12vh) scale(0.3);
  }
  54.1666666667% {
    transform: translateX(-24vw) translateY(-31vh) scale(0.84);
  }
  58.3333333333% {
    transform: translateX(-9vw) translateY(48vh) scale(0.38);
  }
  62.5% {
    transform: translateX(-28vw) translateY(6vh) scale(0.34);
  }
  66.6666666667% {
    transform: translateX(34vw) translateY(-22vh) scale(0.28);
  }
  70.8333333333% {
    transform: translateX(40vw) translateY(-37vh) scale(0.91);
  }
  75% {
    transform: translateX(3vw) translateY(-34vh) scale(0.58);
  }
  79.1666666667% {
    transform: translateX(21vw) translateY(-36vh) scale(0.83);
  }
  83.3333333333% {
    transform: translateX(-37vw) translateY(23vh) scale(0.89);
  }
  87.5% {
    transform: translateX(10vw) translateY(-17vh) scale(0.84);
  }
  91.6666666667% {
    transform: translateX(30vw) translateY(17vh) scale(0.51);
  }
  95.8333333333% {
    transform: translateX(-1vw) translateY(-11vh) scale(0.34);
  }
  100% {
    transform: translateX(-6vw) translateY(22vh) scale(0.62);
  }
}
.firefly:nth-child(2) {
  animation-name: move2;
}
.firefly:nth-child(2)::before {
  animation-duration: 17s;
}
.firefly:nth-child(2)::after {
  animation-duration: 17s, 7082ms;
  animation-delay: 0ms, 2155ms;
}

@keyframes move2 {
  0% {
    transform: translateX(-26vw) translateY(-46vh) scale(0.45);
  }
  3.8461538462% {
    transform: translateX(29vw) translateY(45vh) scale(0.84);
  }
  7.6923076923% {
    transform: translateX(45vw) translateY(24vh) scale(0.77);
  }
  11.5384615385% {
    transform: translateX(-35vw) translateY(-43vh) scale(0.36);
  }
  15.3846153846% {
    transform: translateX(15vw) translateY(-7vh) scale(0.27);
  }
  19.2307692308% {
    transform: translateX(26vw) translateY(-25vh) scale(0.92);
  }
  23.0769230769% {
    transform: translateX(-6vw) translateY(19vh) scale(0.94);
  }
  26.9230769231% {
    transform: translateX(-34vw) translateY(24vh) scale(0.46);
  }
  30.7692307692% {
    transform: translateX(-36vw) translateY(32vh) scale(0.73);
  }
  34.6153846154% {
    transform: translateX(-46vw) translateY(-14vh) scale(0.84);
  }
  38.4615384615% {
    transform: translateX(2vw) translateY(46vh) scale(0.61);
  }
  42.3076923077% {
    transform: translateX(37vw) translateY(-38vh) scale(0.66);
  }
  46.1538461538% {
    transform: translateX(3vw) translateY(-46vh) scale(0.42);
  }
  50% {
    transform: translateX(-32vw) translateY(14vh) scale(0.92);
  }
  53.8461538462% {
    transform: translateX(-30vw) translateY(-34vh) scale(0.86);
  }
  57.6923076923% {
    transform: translateX(26vw) translateY(1vh) scale(0.79);
  }
  61.5384615385% {
    transform: translateX(20vw) translateY(-8vh) scale(0.4);
  }
  65.3846153846% {
    transform: translateX(-3vw) translateY(1vh) scale(0.48);
  }
  69.2307692308% {
    transform: translateX(17vw) translateY(10vh) scale(0.35);
  }
  73.0769230769% {
    transform: translateX(40vw) translateY(-23vh) scale(0.64);
  }
  76.9230769231% {
    transform: translateX(11vw) translateY(-9vh) scale(0.32);
  }
  80.7692307692% {
    transform: translateX(24vw) translateY(50vh) scale(0.27);
  }
  84.6153846154% {
    transform: translateX(-21vw) translateY(-40vh) scale(0.98);
  }
  88.4615384615% {
    transform: translateX(23vw) translateY(0vh) scale(0.44);
  }
  92.3076923077% {
    transform: translateX(-14vw) translateY(39vh) scale(0.84);
  }
  96.1538461538% {
    transform: translateX(0vw) translateY(25vh) scale(0.55);
  }
  100% {
    transform: translateX(21vw) translateY(23vh) scale(0.87);
  }
}
.firefly:nth-child(3) {
  animation-name: move3;
}
.firefly:nth-child(3)::before {
  animation-duration: 11s;
}
.firefly:nth-child(3)::after {
  animation-duration: 11s, 6095ms;
  animation-delay: 0ms, 4479ms;
}

@keyframes move3 {
  0% {
    transform: translateX(20vw) translateY(-11vh) scale(0.94);
  }
  4.7619047619% {
    transform: translateX(-17vw) translateY(-9vh) scale(0.32);
  }
  9.5238095238% {
    transform: translateX(41vw) translateY(-12vh) scale(0.67);
  }
  14.2857142857% {
    transform: translateX(46vw) translateY(-17vh) scale(0.81);
  }
  19.0476190476% {
    transform: translateX(17vw) translateY(31vh) scale(0.83);
  }
  23.8095238095% {
    transform: translateX(24vw) translateY(26vh) scale(0.36);
  }
  28.5714285714% {
    transform: translateX(36vw) translateY(15vh) scale(0.26);
  }
  33.3333333333% {
    transform: translateX(15vw) translateY(-18vh) scale(0.52);
  }
  38.0952380952% {
    transform: translateX(24vw) translateY(50vh) scale(0.26);
  }
  42.8571428571% {
    transform: translateX(-47vw) translateY(-21vh) scale(0.69);
  }
  47.619047619% {
    transform: translateX(-45vw) translateY(37vh) scale(0.8);
  }
  52.380952381% {
    transform: translateX(40vw) translateY(45vh) scale(0.48);
  }
  57.1428571429% {
    transform: translateX(-47vw) translateY(-18vh) scale(0.76);
  }
  61.9047619048% {
    transform: translateX(-32vw) translateY(2vh) scale(0.74);
  }
  66.6666666667% {
    transform: translateX(43vw) translateY(-7vh) scale(0.36);
  }
  71.4285714286% {
    transform: translateX(-1vw) translateY(35vh) scale(0.55);
  }
  76.1904761905% {
    transform: translateX(7vw) translateY(-5vh) scale(0.3);
  }
  80.9523809524% {
    transform: translateX(36vw) translateY(-46vh) scale(0.61);
  }
  85.7142857143% {
    transform: translateX(-15vw) translateY(-16vh) scale(0.32);
  }
  90.4761904762% {
    transform: translateX(4vw) translateY(-33vh) scale(0.74);
  }
  95.2380952381% {
    transform: translateX(-38vw) translateY(-39vh) scale(0.9);
  }
  100% {
    transform: translateX(37vw) translateY(21vh) scale(0.66);
  }
}
.firefly:nth-child(4) {
  animation-name: move4;
}
.firefly:nth-child(4)::before {
  animation-duration: 15s;
}
.firefly:nth-child(4)::after {
  animation-duration: 15s, 6413ms;
  animation-delay: 0ms, 3736ms;
}

@keyframes move4 {
  0% {
    transform: translateX(3vw) translateY(-6vh) scale(0.29);
  }
  5.5555555556% {
    transform: translateX(-14vw) translateY(4vh) scale(0.59);
  }
  11.1111111111% {
    transform: translateX(10vw) translateY(-21vh) scale(0.9);
  }
  16.6666666667% {
    transform: translateX(-32vw) translateY(16vh) scale(0.45);
  }
  22.2222222222% {
    transform: translateX(45vw) translateY(44vh) scale(0.63);
  }
  27.7777777778% {
    transform: translateX(-6vw) translateY(18vh) scale(1);
  }
  33.3333333333% {
    transform: translateX(-33vw) translateY(-39vh) scale(0.87);
  }
  38.8888888889% {
    transform: translateX(-1vw) translateY(-28vh) scale(0.42);
  }
  44.4444444444% {
    transform: translateX(-10vw) translateY(32vh) scale(0.45);
  }
  50% {
    transform: translateX(49vw) translateY(-40vh) scale(0.26);
  }
  55.5555555556% {
    transform: translateX(27vw) translateY(42vh) scale(0.62);
  }
  61.1111111111% {
    transform: translateX(14vw) translateY(33vh) scale(0.91);
  }
  66.6666666667% {
    transform: translateX(2vw) translateY(43vh) scale(0.48);
  }
  72.2222222222% {
    transform: translateX(30vw) translateY(4vh) scale(0.74);
  }
  77.7777777778% {
    transform: translateX(48vw) translateY(-19vh) scale(0.41);
  }
  83.3333333333% {
    transform: translateX(18vw) translateY(-33vh) scale(0.61);
  }
  88.8888888889% {
    transform: translateX(-49vw) translateY(-37vh) scale(0.74);
  }
  94.4444444444% {
    transform: translateX(-32vw) translateY(41vh) scale(0.38);
  }
  100% {
    transform: translateX(34vw) translateY(20vh) scale(0.32);
  }
}
.firefly:nth-child(5) {
  animation-name: move5;
}
.firefly:nth-child(5)::before {
  animation-duration: 11s;
}
.firefly:nth-child(5)::after {
  animation-duration: 11s, 7664ms;
  animation-delay: 0ms, 8347ms;
}

@keyframes move5 {
  0% {
    transform: translateX(4vw) translateY(-7vh) scale(0.77);
  }
  4.347826087% {
    transform: translateX(24vw) translateY(47vh) scale(0.41);
  }
  8.6956521739% {
    transform: translateX(14vw) translateY(15vh) scale(0.82);
  }
  13.0434782609% {
    transform: translateX(-20vw) translateY(50vh) scale(0.65);
  }
  17.3913043478% {
    transform: translateX(13vw) translateY(37vh) scale(0.95);
  }
  21.7391304348% {
    transform: translateX(17vw) translateY(-27vh) scale(0.92);
  }
  26.0869565217% {
    transform: translateX(-32vw) translateY(-3vh) scale(0.26);
  }
  30.4347826087% {
    transform: translateX(-35vw) translateY(-39vh) scale(0.81);
  }
  34.7826086957% {
    transform: translateX(1vw) translateY(-38vh) scale(0.93);
  }
  39.1304347826% {
    transform: translateX(-31vw) translateY(-41vh) scale(0.69);
  }
  43.4782608696% {
    transform: translateX(47vw) translateY(-48vh) scale(0.94);
  }
  47.8260869565% {
    transform: translateX(-17vw) translateY(-46vh) scale(0.3);
  }
  52.1739130435% {
    transform: translateX(17vw) translateY(-40vh) scale(0.77);
  }
  56.5217391304% {
    transform: translateX(-12vw) translateY(25vh) scale(0.62);
  }
  60.8695652174% {
    transform: translateX(37vw) translateY(5vh) scale(0.95);
  }
  65.2173913043% {
    transform: translateX(-8vw) translateY(10vh) scale(0.53);
  }
  69.5652173913% {
    transform: translateX(-27vw) translateY(46vh) scale(0.5);
  }
  73.9130434783% {
    transform: translateX(-38vw) translateY(14vh) scale(0.97);
  }
  78.2608695652% {
    transform: translateX(0vw) translateY(-15vh) scale(0.99);
  }
  82.6086956522% {
    transform: translateX(2vw) translateY(-18vh) scale(0.5);
  }
  86.9565217391% {
    transform: translateX(47vw) translateY(-45vh) scale(0.71);
  }
  91.3043478261% {
    transform: translateX(23vw) translateY(-19vh) scale(0.53);
  }
  95.652173913% {
    transform: translateX(12vw) translateY(43vh) scale(0.67);
  }
  100% {
    transform: translateX(15vw) translateY(-26vh) scale(0.65);
  }
}
.firefly:nth-child(6) {
  animation-name: move6;
}
.firefly:nth-child(6)::before {
  animation-duration: 16s;
}
.firefly:nth-child(6)::after {
  animation-duration: 16s, 5283ms;
  animation-delay: 0ms, 5554ms;
}

@keyframes move6 {
  0% {
    transform: translateX(7vw) translateY(-15vh) scale(0.81);
  }
  4.5454545455% {
    transform: translateX(2vw) translateY(-42vh) scale(0.52);
  }
  9.0909090909% {
    transform: translateX(-14vw) translateY(40vh) scale(0.7);
  }
  13.6363636364% {
    transform: translateX(-38vw) translateY(-43vh) scale(0.93);
  }
  18.1818181818% {
    transform: translateX(-35vw) translateY(-49vh) scale(0.57);
  }
  22.7272727273% {
    transform: translateX(10vw) translateY(17vh) scale(0.51);
  }
  27.2727272727% {
    transform: translateX(49vw) translateY(32vh) scale(0.51);
  }
  31.8181818182% {
    transform: translateX(-39vw) translateY(3vh) scale(0.76);
  }
  36.3636363636% {
    transform: translateX(29vw) translateY(22vh) scale(0.28);
  }
  40.9090909091% {
    transform: translateX(-37vw) translateY(15vh) scale(0.3);
  }
  45.4545454545% {
    transform: translateX(-43vw) translateY(-48vh) scale(0.54);
  }
  50% {
    transform: translateX(-18vw) translateY(12vh) scale(0.38);
  }
  54.5454545455% {
    transform: translateX(-43vw) translateY(-31vh) scale(0.96);
  }
  59.0909090909% {
    transform: translateX(-45vw) translateY(-12vh) scale(0.73);
  }
  63.6363636364% {
    transform: translateX(-31vw) translateY(26vh) scale(0.32);
  }
  68.1818181818% {
    transform: translateX(25vw) translateY(-44vh) scale(0.34);
  }
  72.7272727273% {
    transform: translateX(-27vw) translateY(46vh) scale(0.77);
  }
  77.2727272727% {
    transform: translateX(-36vw) translateY(6vh) scale(0.87);
  }
  81.8181818182% {
    transform: translateX(33vw) translateY(47vh) scale(0.64);
  }
  86.3636363636% {
    transform: translateX(-5vw) translateY(38vh) scale(0.94);
  }
  90.9090909091% {
    transform: translateX(13vw) translateY(-13vh) scale(0.8);
  }
  95.4545454545% {
    transform: translateX(23vw) translateY(-49vh) scale(0.57);
  }
  100% {
    transform: translateX(-17vw) translateY(-28vh) scale(0.9);
  }
}
.firefly:nth-child(7) {
  animation-name: move7;
}
.firefly:nth-child(7)::before {
  animation-duration: 13s;
}
.firefly:nth-child(7)::after {
  animation-duration: 13s, 5664ms;
  animation-delay: 0ms, 4590ms;
}

@keyframes move7 {
  0% {
    transform: translateX(-35vw) translateY(-23vh) scale(0.86);
  }
  5.5555555556% {
    transform: translateX(25vw) translateY(49vh) scale(0.7);
  }
  11.1111111111% {
    transform: translateX(13vw) translateY(-5vh) scale(0.53);
  }
  16.6666666667% {
    transform: translateX(35vw) translateY(47vh) scale(0.97);
  }
  22.2222222222% {
    transform: translateX(-20vw) translateY(-37vh) scale(0.98);
  }
  27.7777777778% {
    transform: translateX(12vw) translateY(-23vh) scale(0.77);
  }
  33.3333333333% {
    transform: translateX(-26vw) translateY(-19vh) scale(0.31);
  }
  38.8888888889% {
    transform: translateX(-34vw) translateY(22vh) scale(0.54);
  }
  44.4444444444% {
    transform: translateX(30vw) translateY(-33vh) scale(0.85);
  }
  50% {
    transform: translateX(30vw) translateY(-23vh) scale(0.51);
  }
  55.5555555556% {
    transform: translateX(-30vw) translateY(13vh) scale(0.95);
  }
  61.1111111111% {
    transform: translateX(-18vw) translateY(50vh) scale(0.9);
  }
  66.6666666667% {
    transform: translateX(-23vw) translateY(-18vh) scale(0.97);
  }
  72.2222222222% {
    transform: translateX(-49vw) translateY(2vh) scale(0.68);
  }
  77.7777777778% {
    transform: translateX(5vw) translateY(-35vh) scale(0.58);
  }
  83.3333333333% {
    transform: translateX(-33vw) translateY(-8vh) scale(0.41);
  }
  88.8888888889% {
    transform: translateX(33vw) translateY(6vh) scale(0.92);
  }
  94.4444444444% {
    transform: translateX(-31vw) translateY(-45vh) scale(0.99);
  }
  100% {
    transform: translateX(28vw) translateY(-46vh) scale(0.97);
  }
}
.firefly:nth-child(8) {
  animation-name: move8;
}
.firefly:nth-child(8)::before {
  animation-duration: 14s;
}
.firefly:nth-child(8)::after {
  animation-duration: 14s, 7841ms;
  animation-delay: 0ms, 4815ms;
}

@keyframes move8 {
  0% {
    transform: translateX(-19vw) translateY(-46vh) scale(0.37);
  }
  5.8823529412% {
    transform: translateX(27vw) translateY(29vh) scale(1);
  }
  11.7647058824% {
    transform: translateX(-12vw) translateY(-25vh) scale(0.28);
  }
  17.6470588235% {
    transform: translateX(-34vw) translateY(48vh) scale(1);
  }
  23.5294117647% {
    transform: translateX(-8vw) translateY(35vh) scale(0.47);
  }
  29.4117647059% {
    transform: translateX(-36vw) translateY(36vh) scale(0.57);
  }
  35.2941176471% {
    transform: translateX(1vw) translateY(11vh) scale(0.26);
  }
  41.1764705882% {
    transform: translateX(4vw) translateY(-21vh) scale(0.29);
  }
  47.0588235294% {
    transform: translateX(32vw) translateY(41vh) scale(0.49);
  }
  52.9411764706% {
    transform: translateX(40vw) translateY(-26vh) scale(0.73);
  }
  58.8235294118% {
    transform: translateX(14vw) translateY(42vh) scale(0.36);
  }
  64.7058823529% {
    transform: translateX(19vw) translateY(41vh) scale(0.85);
  }
  70.5882352941% {
    transform: translateX(34vw) translateY(46vh) scale(0.62);
  }
  76.4705882353% {
    transform: translateX(38vw) translateY(-1vh) scale(0.99);
  }
  82.3529411765% {
    transform: translateX(-12vw) translateY(13vh) scale(0.48);
  }
  88.2352941176% {
    transform: translateX(-8vw) translateY(-20vh) scale(0.33);
  }
  94.1176470588% {
    transform: translateX(-27vw) translateY(19vh) scale(0.95);
  }
  100% {
    transform: translateX(20vw) translateY(-42vh) scale(0.64);
  }
}
.firefly:nth-child(9) {
  animation-name: move9;
}
.firefly:nth-child(9)::before {
  animation-duration: 11s;
}
.firefly:nth-child(9)::after {
  animation-duration: 11s, 8027ms;
  animation-delay: 0ms, 8163ms;
}

@keyframes move9 {
  0% {
    transform: translateX(31vw) translateY(-14vh) scale(0.91);
  }
  3.5714285714% {
    transform: translateX(21vw) translateY(-30vh) scale(1);
  }
  7.1428571429% {
    transform: translateX(1vw) translateY(13vh) scale(0.57);
  }
  10.7142857143% {
    transform: translateX(-20vw) translateY(4vh) scale(0.94);
  }
  14.2857142857% {
    transform: translateX(-40vw) translateY(-13vh) scale(0.92);
  }
  17.8571428571% {
    transform: translateX(42vw) translateY(15vh) scale(0.87);
  }
  21.4285714286% {
    transform: translateX(-28vw) translateY(-11vh) scale(0.59);
  }
  25% {
    transform: translateX(-43vw) translateY(26vh) scale(0.94);
  }
  28.5714285714% {
    transform: translateX(-20vw) translateY(31vh) scale(1);
  }
  32.1428571429% {
    transform: translateX(24vw) translateY(-38vh) scale(0.37);
  }
  35.7142857143% {
    transform: translateX(24vw) translateY(22vh) scale(0.49);
  }
  39.2857142857% {
    transform: translateX(13vw) translateY(3vh) scale(0.28);
  }
  42.8571428571% {
    transform: translateX(-45vw) translateY(-16vh) scale(0.88);
  }
  46.4285714286% {
    transform: translateX(-6vw) translateY(20vh) scale(0.46);
  }
  50% {
    transform: translateX(21vw) translateY(-15vh) scale(0.53);
  }
  53.5714285714% {
    transform: translateX(33vw) translateY(-16vh) scale(0.28);
  }
  57.1428571429% {
    transform: translateX(33vw) translateY(-41vh) scale(1);
  }
  60.7142857143% {
    transform: translateX(-34vw) translateY(-23vh) scale(0.74);
  }
  64.2857142857% {
    transform: translateX(37vw) translateY(12vh) scale(0.95);
  }
  67.8571428571% {
    transform: translateX(20vw) translateY(-22vh) scale(0.49);
  }
  71.4285714286% {
    transform: translateX(-41vw) translateY(18vh) scale(0.57);
  }
  75% {
    transform: translateX(-39vw) translateY(-15vh) scale(0.55);
  }
  78.5714285714% {
    transform: translateX(34vw) translateY(0vh) scale(0.46);
  }
  82.1428571429% {
    transform: translateX(-48vw) translateY(40vh) scale(0.66);
  }
  85.7142857143% {
    transform: translateX(-32vw) translateY(-18vh) scale(0.37);
  }
  89.2857142857% {
    transform: translateX(19vw) translateY(27vh) scale(0.64);
  }
  92.8571428571% {
    transform: translateX(-33vw) translateY(49vh) scale(0.9);
  }
  96.4285714286% {
    transform: translateX(-12vw) translateY(26vh) scale(0.5);
  }
  100% {
    transform: translateX(-42vw) translateY(-42vh) scale(0.8);
  }
}
.firefly:nth-child(10) {
  animation-name: move10;
}
.firefly:nth-child(10)::before {
  animation-duration: 9s;
}
.firefly:nth-child(10)::after {
  animation-duration: 9s, 5195ms;
  animation-delay: 0ms, 3976ms;
}

@keyframes move10 {
  0% {
    transform: translateX(24vw) translateY(0vh) scale(0.72);
  }
  5% {
    transform: translateX(-47vw) translateY(31vh) scale(0.66);
  }
  10% {
    transform: translateX(-9vw) translateY(13vh) scale(0.35);
  }
  15% {
    transform: translateX(-40vw) translateY(7vh) scale(0.27);
  }
  20% {
    transform: translateX(10vw) translateY(26vh) scale(0.54);
  }
  25% {
    transform: translateX(-49vw) translateY(35vh) scale(0.78);
  }
  30% {
    transform: translateX(49vw) translateY(33vh) scale(0.5);
  }
  35% {
    transform: translateX(-33vw) translateY(-12vh) scale(0.62);
  }
  40% {
    transform: translateX(-16vw) translateY(36vh) scale(0.65);
  }
  45% {
    transform: translateX(44vw) translateY(-11vh) scale(0.33);
  }
  50% {
    transform: translateX(1vw) translateY(18vh) scale(0.44);
  }
  55% {
    transform: translateX(-41vw) translateY(12vh) scale(0.56);
  }
  60% {
    transform: translateX(-38vw) translateY(26vh) scale(0.6);
  }
  65% {
    transform: translateX(-5vw) translateY(-38vh) scale(0.57);
  }
  70% {
    transform: translateX(38vw) translateY(-38vh) scale(0.56);
  }
  75% {
    transform: translateX(0vw) translateY(-34vh) scale(0.4);
  }
  80% {
    transform: translateX(40vw) translateY(-45vh) scale(0.42);
  }
  85% {
    transform: translateX(-31vw) translateY(-14vh) scale(0.87);
  }
  90% {
    transform: translateX(-40vw) translateY(3vh) scale(0.52);
  }
  95% {
    transform: translateX(-41vw) translateY(26vh) scale(0.47);
  }
  100% {
    transform: translateX(19vw) translateY(22vh) scale(0.67);
  }
}
.firefly:nth-child(11) {
  animation-name: move11;
}
.firefly:nth-child(11)::before {
  animation-duration: 14s;
}
.firefly:nth-child(11)::after {
  animation-duration: 14s, 7912ms;
  animation-delay: 0ms, 1366ms;
}

@keyframes move11 {
  0% {
    transform: translateX(-25vw) translateY(-12vh) scale(0.32);
  }
  4.5454545455% {
    transform: translateX(30vw) translateY(-26vh) scale(0.83);
  }
  9.0909090909% {
    transform: translateX(18vw) translateY(48vh) scale(0.9);
  }
  13.6363636364% {
    transform: translateX(5vw) translateY(45vh) scale(0.51);
  }
  18.1818181818% {
    transform: translateX(-45vw) translateY(20vh) scale(0.73);
  }
  22.7272727273% {
    transform: translateX(24vw) translateY(7vh) scale(0.32);
  }
  27.2727272727% {
    transform: translateX(-12vw) translateY(29vh) scale(0.82);
  }
  31.8181818182% {
    transform: translateX(44vw) translateY(-26vh) scale(0.44);
  }
  36.3636363636% {
    transform: translateX(41vw) translateY(-48vh) scale(0.8);
  }
  40.9090909091% {
    transform: translateX(1vw) translateY(2vh) scale(0.5);
  }
  45.4545454545% {
    transform: translateX(29vw) translateY(-25vh) scale(0.54);
  }
  50% {
    transform: translateX(-14vw) translateY(-12vh) scale(0.81);
  }
  54.5454545455% {
    transform: translateX(43vw) translateY(44vh) scale(0.81);
  }
  59.0909090909% {
    transform: translateX(-16vw) translateY(-23vh) scale(0.75);
  }
  63.6363636364% {
    transform: translateX(26vw) translateY(-40vh) scale(0.56);
  }
  68.1818181818% {
    transform: translateX(-29vw) translateY(-37vh) scale(0.46);
  }
  72.7272727273% {
    transform: translateX(45vw) translateY(-25vh) scale(0.3);
  }
  77.2727272727% {
    transform: translateX(42vw) translateY(-38vh) scale(0.94);
  }
  81.8181818182% {
    transform: translateX(1vw) translateY(-26vh) scale(0.69);
  }
  86.3636363636% {
    transform: translateX(36vw) translateY(-11vh) scale(0.97);
  }
  90.9090909091% {
    transform: translateX(-3vw) translateY(-8vh) scale(0.98);
  }
  95.4545454545% {
    transform: translateX(-34vw) translateY(12vh) scale(0.97);
  }
  100% {
    transform: translateX(-14vw) translateY(31vh) scale(0.85);
  }
}
.firefly:nth-child(12) {
  animation-name: move12;
}
.firefly:nth-child(12)::before {
  animation-duration: 16s;
}
.firefly:nth-child(12)::after {
  animation-duration: 16s, 6733ms;
  animation-delay: 0ms, 4779ms;
}

@keyframes move12 {
  0% {
    transform: translateX(-41vw) translateY(-23vh) scale(0.54);
  }
  3.7037037037% {
    transform: translateX(-13vw) translateY(34vh) scale(0.66);
  }
  7.4074074074% {
    transform: translateX(-32vw) translateY(5vh) scale(0.48);
  }
  11.1111111111% {
    transform: translateX(30vw) translateY(7vh) scale(0.43);
  }
  14.8148148148% {
    transform: translateX(-20vw) translateY(37vh) scale(0.46);
  }
  18.5185185185% {
    transform: translateX(45vw) translateY(-13vh) scale(0.92);
  }
  22.2222222222% {
    transform: translateX(16vw) translateY(29vh) scale(0.3);
  }
  25.9259259259% {
    transform: translateX(-9vw) translateY(48vh) scale(0.32);
  }
  29.6296296296% {
    transform: translateX(4vw) translateY(3vh) scale(0.39);
  }
  33.3333333333% {
    transform: translateX(34vw) translateY(-37vh) scale(0.88);
  }
  37.037037037% {
    transform: translateX(0vw) translateY(-46vh) scale(0.67);
  }
  40.7407407407% {
    transform: translateX(18vw) translateY(-3vh) scale(0.49);
  }
  44.4444444444% {
    transform: translateX(31vw) translateY(-33vh) scale(0.91);
  }
  48.1481481481% {
    transform: translateX(-46vw) translateY(46vh) scale(0.6);
  }
  51.8518518519% {
    transform: translateX(3vw) translateY(-2vh) scale(0.66);
  }
  55.5555555556% {
    transform: translateX(34vw) translateY(1vh) scale(0.26);
  }
  59.2592592593% {
    transform: translateX(5vw) translateY(-15vh) scale(0.63);
  }
  62.962962963% {
    transform: translateX(38vw) translateY(30vh) scale(0.56);
  }
  66.6666666667% {
    transform: translateX(41vw) translateY(-48vh) scale(0.53);
  }
  70.3703703704% {
    transform: translateX(-42vw) translateY(34vh) scale(0.46);
  }
  74.0740740741% {
    transform: translateX(18vw) translateY(-46vh) scale(0.38);
  }
  77.7777777778% {
    transform: translateX(-12vw) translateY(-17vh) scale(0.34);
  }
  81.4814814815% {
    transform: translateX(42vw) translateY(45vh) scale(0.35);
  }
  85.1851851852% {
    transform: translateX(40vw) translateY(-34vh) scale(0.27);
  }
  88.8888888889% {
    transform: translateX(14vw) translateY(29vh) scale(0.73);
  }
  92.5925925926% {
    transform: translateX(11vw) translateY(7vh) scale(0.82);
  }
  96.2962962963% {
    transform: translateX(22vw) translateY(-10vh) scale(0.58);
  }
  100% {
    transform: translateX(39vw) translateY(-23vh) scale(0.8);
  }
}
.firefly:nth-child(13) {
  animation-name: move13;
}
.firefly:nth-child(13)::before {
  animation-duration: 18s;
}
.firefly:nth-child(13)::after {
  animation-duration: 18s, 6422ms;
  animation-delay: 0ms, 8360ms;
}

@keyframes move13 {
  0% {
    transform: translateX(30vw) translateY(-44vh) scale(0.65);
  }
  3.5714285714% {
    transform: translateX(46vw) translateY(-21vh) scale(0.81);
  }
  7.1428571429% {
    transform: translateX(24vw) translateY(4vh) scale(0.72);
  }
  10.7142857143% {
    transform: translateX(50vw) translateY(-43vh) scale(0.38);
  }
  14.2857142857% {
    transform: translateX(-35vw) translateY(2vh) scale(0.74);
  }
  17.8571428571% {
    transform: translateX(35vw) translateY(-11vh) scale(0.3);
  }
  21.4285714286% {
    transform: translateX(-24vw) translateY(6vh) scale(1);
  }
  25% {
    transform: translateX(-24vw) translateY(-22vh) scale(0.69);
  }
  28.5714285714% {
    transform: translateX(-19vw) translateY(38vh) scale(0.58);
  }
  32.1428571429% {
    transform: translateX(5vw) translateY(-36vh) scale(0.91);
  }
  35.7142857143% {
    transform: translateX(19vw) translateY(0vh) scale(0.72);
  }
  39.2857142857% {
    transform: translateX(-16vw) translateY(-5vh) scale(0.33);
  }
  42.8571428571% {
    transform: translateX(43vw) translateY(49vh) scale(0.47);
  }
  46.4285714286% {
    transform: translateX(19vw) translateY(-21vh) scale(0.68);
  }
  50% {
    transform: translateX(3vw) translateY(47vh) scale(0.86);
  }
  53.5714285714% {
    transform: translateX(-45vw) translateY(-11vh) scale(0.26);
  }
  57.1428571429% {
    transform: translateX(10vw) translateY(39vh) scale(0.63);
  }
  60.7142857143% {
    transform: translateX(-5vw) translateY(-20vh) scale(0.37);
  }
  64.2857142857% {
    transform: translateX(17vw) translateY(24vh) scale(0.92);
  }
  67.8571428571% {
    transform: translateX(-9vw) translateY(18vh) scale(0.56);
  }
  71.4285714286% {
    transform: translateX(-4vw) translateY(-28vh) scale(0.64);
  }
  75% {
    transform: translateX(12vw) translateY(42vh) scale(0.74);
  }
  78.5714285714% {
    transform: translateX(-45vw) translateY(24vh) scale(0.93);
  }
  82.1428571429% {
    transform: translateX(14vw) translateY(0vh) scale(0.3);
  }
  85.7142857143% {
    transform: translateX(40vw) translateY(31vh) scale(0.45);
  }
  89.2857142857% {
    transform: translateX(-42vw) translateY(-10vh) scale(0.83);
  }
  92.8571428571% {
    transform: translateX(38vw) translateY(42vh) scale(0.39);
  }
  96.4285714286% {
    transform: translateX(16vw) translateY(-38vh) scale(0.73);
  }
  100% {
    transform: translateX(-42vw) translateY(-7vh) scale(0.71);
  }
}
.firefly:nth-child(14) {
  animation-name: move14;
}
.firefly:nth-child(14)::before {
  animation-duration: 11s;
}
.firefly:nth-child(14)::after {
  animation-duration: 11s, 6021ms;
  animation-delay: 0ms, 987ms;
}

@keyframes move14 {
  0% {
    transform: translateX(-4vw) translateY(5vh) scale(0.73);
  }
  5.2631578947% {
    transform: translateX(0vw) translateY(-25vh) scale(0.92);
  }
  10.5263157895% {
    transform: translateX(-29vw) translateY(-46vh) scale(0.99);
  }
  15.7894736842% {
    transform: translateX(-9vw) translateY(-14vh) scale(0.46);
  }
  21.0526315789% {
    transform: translateX(37vw) translateY(32vh) scale(0.91);
  }
  26.3157894737% {
    transform: translateX(-29vw) translateY(-37vh) scale(0.48);
  }
  31.5789473684% {
    transform: translateX(36vw) translateY(-37vh) scale(0.62);
  }
  36.8421052632% {
    transform: translateX(-41vw) translateY(22vh) scale(0.83);
  }
  42.1052631579% {
    transform: translateX(23vw) translateY(34vh) scale(0.74);
  }
  47.3684210526% {
    transform: translateX(2vw) translateY(14vh) scale(0.88);
  }
  52.6315789474% {
    transform: translateX(-11vw) translateY(-9vh) scale(0.85);
  }
  57.8947368421% {
    transform: translateX(-6vw) translateY(22vh) scale(0.87);
  }
  63.1578947368% {
    transform: translateX(40vw) translateY(18vh) scale(0.36);
  }
  68.4210526316% {
    transform: translateX(11vw) translateY(-29vh) scale(0.68);
  }
  73.6842105263% {
    transform: translateX(27vw) translateY(-1vh) scale(0.44);
  }
  78.9473684211% {
    transform: translateX(-35vw) translateY(9vh) scale(0.65);
  }
  84.2105263158% {
    transform: translateX(38vw) translateY(-23vh) scale(0.5);
  }
  89.4736842105% {
    transform: translateX(-5vw) translateY(-15vh) scale(0.96);
  }
  94.7368421053% {
    transform: translateX(-23vw) translateY(41vh) scale(0.59);
  }
  100% {
    transform: translateX(12vw) translateY(4vh) scale(0.85);
  }
}
.firefly:nth-child(15) {
  animation-name: move15;
}
.firefly:nth-child(15)::before {
  animation-duration: 16s;
}
.firefly:nth-child(15)::after {
  animation-duration: 16s, 10663ms;
  animation-delay: 0ms, 4261ms;
}

@keyframes move15 {
  0% {
    transform: translateX(-38vw) translateY(-15vh) scale(0.91);
  }
  5.8823529412% {
    transform: translateX(13vw) translateY(1vh) scale(0.92);
  }
  11.7647058824% {
    transform: translateX(-32vw) translateY(-19vh) scale(0.96);
  }
  17.6470588235% {
    transform: translateX(11vw) translateY(14vh) scale(0.78);
  }
  23.5294117647% {
    transform: translateX(10vw) translateY(22vh) scale(0.37);
  }
  29.4117647059% {
    transform: translateX(46vw) translateY(-36vh) scale(0.91);
  }
  35.2941176471% {
    transform: translateX(-6vw) translateY(40vh) scale(0.36);
  }
  41.1764705882% {
    transform: translateX(-45vw) translateY(-14vh) scale(0.61);
  }
  47.0588235294% {
    transform: translateX(2vw) translateY(17vh) scale(0.33);
  }
  52.9411764706% {
    transform: translateX(0vw) translateY(9vh) scale(0.32);
  }
  58.8235294118% {
    transform: translateX(3vw) translateY(31vh) scale(0.57);
  }
  64.7058823529% {
    transform: translateX(0vw) translateY(27vh) scale(0.62);
  }
  70.5882352941% {
    transform: translateX(3vw) translateY(-2vh) scale(0.73);
  }
  76.4705882353% {
    transform: translateX(-15vw) translateY(19vh) scale(0.83);
  }
  82.3529411765% {
    transform: translateX(5vw) translateY(-25vh) scale(0.84);
  }
  88.2352941176% {
    transform: translateX(5vw) translateY(30vh) scale(0.27);
  }
  94.1176470588% {
    transform: translateX(29vw) translateY(16vh) scale(0.87);
  }
  100% {
    transform: translateX(3vw) translateY(-11vh) scale(0.87);
  }
}
@keyframes drift {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes flash {
  0%, 30%, 100% {
    opacity: 0;
    box-shadow: 0 0 0vw 0vw yellow;
  }
  5% {
    opacity: 1;
    box-shadow: 0 0 2vw 0.4vw yellow;
  }
} 
</style>