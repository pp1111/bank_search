$(document).ready(function () {
    $('#searcharea').autocomplete({
        source: function (req, res) {
            $.ajax({
                url: "http://localhost:4000/autocomplete/" + req.term,
                dataType: "jsonp",
                type: "GET",
                data: {
                    term: req.term
                }   
            }).done(function (data) {
                res($.map(data, function (item) {
                    return {
                        value: item.name
                    };
                }));
            }).fail(function () {
                alert('Error');
            });
        },
        select: function (event, ui) {

        }
    });

});