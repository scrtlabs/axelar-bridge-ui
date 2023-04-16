<template>
  <div>
    <div class="input-coin" id="input-coin">
      <img :src="require('~/assets/tokens/3d/input/' + fromImage)" style="width: 100px; height: 100px"
           alt="token used to animate source network"/>
    </div>

    <div class="output-coin" id="output-coin">
      <img :src="require('~/assets/tokens/3d/output/' + toImage)" style="width: 90px; height: 90px"
           alt="token used to animate destination network"/>
    </div>
  </div>
</template>
<script>
export default {
    name: 'selected-token-images',
    props: {
        toImage: {},
        fromImage: {}
    }
}
</script>
<style scoped>

.input-coin {
    position: absolute;
    left: -200px;
    bottom: 320px;
    opacity: 0;
}

.output-coin {
    position: absolute;
    right: 200px;
    bottom: 270px;
    opacity: 0;
}

@keyframes input-coin-anim {
    0% {
        transform: translate(0px, 250px);
        opacity: 0;
    }

    5% {
        opacity: 0;
    }

    20% {
        opacity: 1;
    }

    90% {
        opacity: 1;
    }

    90.1% {
        opacity: 0;
    }

    100% {
        transform: translate(400px, 0px);
        opacity: 0;
    }
}

@keyframes output-coin-anim {
    0% {
        transform: translate(0px, 0px);
        opacity: 0;
    }

    5% {
        opacity: 0;
    }

    20% {
        opacity: 1;
    }

    80% {
        opacity: 1;
    }

    95% {
        opacity: 0;
    }

    100% {
        transform: translate(430px, 250px);
        opacity: 0;
    }
}

>>> .right-input input::selection {
    background-color: #ff8c00;
}

>>> .right-input input {
    text-align: right;
}

.address-input >>> input::selection {
    background-color: #ff8c00;
}

.address-input >>> input {
    padding: 10px !important;
    background-color: rgb(54, 53, 73) !important;
    border-radius: 10px !important;
}

/* Hide the arrows of number field */
.number-input >>> input::-webkit-outer-spin-button,
.number-input >>> input::-webkit-inner-spin-button {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
}

</style>
