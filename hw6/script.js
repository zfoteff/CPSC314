$(window).ready(function() {
    var seconds = 00;
    var tens = 00;
    var $appendTens = $("#tens")
    var $appendSeconds = $("#seconds")
    var $buttonStart = $('#button-start');
    var $buttonStop = $('#button-stop');
    var $buttonReset = $('#button-reset');
    var interval;
    var opacity = 1.0;
    var opa_step = 0.005;

    //  Page styling
    $('.wrapper').css('background-color', '#ffffff');
    $('.wrapper').css('margin-top', '10%');
    $('.wrapper').css('margin-left', '30%');
    $('.wrapper').css('margin-right', '30%');
    $('.wrapper').css('padding', '2%');
    $('.wrapper').css('margin-top', '10%');
    $('.wrapper').css('border', '5px #000000 solid');
    $('.wrapper').css('border-radius', '12px');
    $('.wrapper').css('margin-top', '10%');

    //  Timer styling
    $("#timer").addClass("timer-background");
    $('#timer').css('font-size', '24px');
    $('#timer').css('justify-content', 'center');
    $('#timer').css('margin-left', '22%');
    $('#timer').css('margin-right', '22%');
    $('#timer').css('color', '#f5f5f5');
    $('#timer').css('border-radius', '5px');

    //  Buton styling
    $('button').addClass('button');
    $('.button').css('color', '#FFFFFF');
    $('.button').css('background-color', '#2f4f4f');
    $('.button').css('border-radius', '12px');
    $('.button').css('padding', '2%');
    $('.button').css("font-size", "18px");
    $('.button').css("box-shadow", "1px 5px #000000");

    $buttonStart.on('click', function() {
        if (seconds == 00 && tens == 00) {
            $("#timer").removeClass("timer-background")
        } else {
            $("#timer").removeClass("timer-stopped");
        }

        $("#timer").addClass("timer-started");
        clearInterval(interval);
        interval = setInterval(startTimer, 10);
    });

    $buttonStop.on('click', function() {
        //  reset opacity
        if (tens > 00 || seconds > 00) {
            $("#timer").removeClass("timer-started");
            $("#timer").addClass("timer-stopped");
            opacity = 1.0;
            $("#timer").css("opacity", opacity);
        } else {
            $("#timer").removeClass("timer-started timer-stopped");
            $("#timer").addClass("timer-background");
            opacity = 1.0;
            $("#timer").css("opacity", opacity);
        }

        clearInterval(interval);
    });

    $buttonReset.on('click', function() {
        opacity = 1.0;
        $("#timer").css("opacity", opacity);

        $("#timer").removeClass("timer-started timer-stopped");
        $("#timer").addClass("timer-background");
        clearInterval(interval);
        tens = "00";
        seconds = "00";
        $appendTens.text(tens);
        $appendSeconds.text(seconds);
    });

    var startTimer = function() {
        tens++;

        if (tens < 9) {
            $appendTens.text("0" + tens);
        }

        if (tens > 9) {
            $appendTens.text(tens);
        }

        if (tens > 99) {
            console.log("seconds");
            seconds++;
            $appendSeconds.text("0" + seconds);
            tens = 0;
            $appendTens.text("0" + 0);
        }

        if (seconds > 9) {
            $appendSeconds.text(seconds);
        }

        //  Change opacity
        console.log(opacity);
        $("#timer").css("opacity", opacity);
        opacity -= opa_step;

        if (opacity < 0.8) {
            opa_step *= -1;
        }
        if (opacity > 1.0) {
            opa_step *= -1;
        }
    }
})