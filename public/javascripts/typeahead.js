$(document).ready(function () {
    $('#searcharea').autocomplete({
        source: (req, res) => {
            $.ajax({
                url: "http://localhost:4000/autocomplete/" + req.term,
                dataType: "jsonp",
                type: "GET",
                data: {
                    term: req.term
                }
            }).done((data) =>{
                res($.map(data,(item) =>{
                    return {
                        value: item.name.toString().toLowerCase()
                    };
                }));
            }).fail(function () {
                alert('Error');
            });
        },
        select: (event, ui) => {
            $('#search').click();
        }
    });
});