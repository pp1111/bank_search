$(document).ready(function(){ 

  document.getElementById("focusedInput").onkeypress = function(){
    if (event.keyCode == 13){
        $( "#calculateStartPage" ).click();
    }
  }
  $('#change').click(function () {
    var tmp = $('#sel1').val();
    $('#sel1').val($('#sel2').val());
    $('#sel2').val(tmp);
    window.location.href = '/przelicznik-walut/' + calc.from.value + '-na-' + calc.on.value + '--' + calc.from.value + '-ile-to-' + calc.on.value + '?amount=' + calc.focusedInput.value + '&year=' + $('#year').val() + '&month=' + $('#month').val() + '&day=' + $('#day').val();
  });

  $('#calculateStartPage').click(function () {
    window.location.href = '/przelicznik-walut/' + calc.from.value + '-na-' + calc.on.value + '--' + calc.from.value + '-ile-to-' + calc.on.value + '?amount=' + calc.focusedInput.value + '&year=' + $('#year').val() + '&month=' + $('#month').val() + '&day=' + $('#day').val();;
  });

  $('#sel1').on('change', function() {
    window.location.href = '/przelicznik-walut/' + calc.from.value + '-na-' + calc.on.value + '--' + calc.from.value + '-ile-to-' + calc.on.value + '?amount=' + calc.focusedInput.value + '&year=' + $('#year').val() + '&month=' + $('#month').val() + '&day=' + $('#day').val();;
  });

  $('#sel2').on('change', function() {
    window.location.href = '/przelicznik-walut/' + calc.from.value + '-na-' + calc.on.value + '--' + calc.from.value + '-ile-to-' + calc.on.value + '?amount=' + calc.focusedInput.value + '&year=' + $('#year').val() + '&month=' + $('#month').val() + '&day=' + $('#day').val();;
  });

  $('#calculate').click(function () {
    if ((calc.year.value === 'Wybierz' || calc.month.value === 'Wybierz' || calc.day.value === 'Wybierz') && !calc.focusedInput.value) {
      $('#text_info').html('Drogi użytkowniku, próbujesz przeliczyć walutę z ' + calc.from.value + ' na ' + calc.on.value + '. Niestety nie podałeś żadnej kwoty do przeliczenia:( Jeśli chcesz przeliczć inną wartość, niż 1 ' + calc.from.value + ', na ' + calc.on.value + ',wpisz ją proszę w pole wyszukiwania, obok pola oblicz. Nie zapomnij również o wyborze odpowiedniej daty.')
    }

    else if ((calc.year.value === 'Wybierz' || calc.month.value === 'Wybierz' || calc.day.value === 'Wybierz') && calc.focusedInput.value) {
      $('#text_info').html('Drogi użytkowniku, nie wybrałeś daty. Jeśli nie chodziło ci o aktualny kurs proszę wybierz datę.');
    }
    
    else {
      $('#text_info').html('');
    }
    var date = $('#year').val() + "-" + $('#month').val() + "-" + $('#day').val();
    $.ajax({
      type: "POST",
      url: '/przelicznik-walut/' + calc.from.value + '-na-' + calc.on.value + '--' + calc.from.value + '-ile-to-' + calc.on.value,
      data: { date: date, amount: calc.focusedInput.value },
      success: function(data) {
        $('#calculated').html( (calc.focusedInput.value || 1) + ' ' + calc.from.value + ' to ' + data.course + ' ' + calc.on.value);
        $('#date').html('Kurs nbp z dnia: ' + data.date);
        $('meta[name=description]').attr('content', data.description);
        document.title = data.title;
        $('#calculateTitle').html(' Przelicznik ' + calc.from.value + ' na ' + calc.on.value);
        //$('link[rel="canonical"]').attr('href', 'bar');
        $('link[rel="canonical"]').attr('href', 'http://amoney.pl/przelicznik/' + calc.from.value + '-na-' + calc.on.value + '--' + calc.from.value + '-ile-to-' + calc.on.value);
      }
    });
  })

  $( "#calculate" ).click();
});


