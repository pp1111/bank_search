$(document).ready(function () {
    $('#searcharea').autocomplete({
        source: (req, res) => {
            $.ajax({
                url: "http://localhost:4000/search/suggestions?q=" + decodeURIComponent(req.term.replace(/ /g,"-")),
                dataType: "jsonp",
                type: "GET",
                data: {
                    term: req.term
                }
            }).done((data) =>{
                res($.map(data, (item) =>{
                    item.term = item.term.replace(/<b>/g, "");
                    item.term = item.term.replace(/<\/b>/g, "")
                    if (JSON.parse(item.payload)) {
                        return {
                            value: item.term.replace(/-/g," ")
                        };
                    }
                }));
            }).fail(function (data) {
                alert('error');
            });
        },
        select: (event, ui) => {
            window.location.href = "/finanse/produkt/" + decodeURIComponent(ui.item.label.replace(/ /g,"-"));
        }
    });

    $("#searcharea").autocomplete("search");
});
