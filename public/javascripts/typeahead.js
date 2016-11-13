$(document).ready(function () {
    $('#searcharea').autocomplete({
        source: (req, res) => {
            $.ajax({
                url: "http://localhost:4000/search/suggestions?q=" + encodeURIComponent(req.term.replace(/ /g,"-")),
                dataType: "jsonp",
                type: "GET",
                data: {
                    term: req.term
                }
            }).done((data) => {
                res($.map(data, (item) => {
                    labels = item.term;
                    labels = labels.replace(/<b>/g, "");
                    labels = labels.replace(/<\/b>/g, "")
                    return {
                        value: labels.replace(/-/g," ")
                    };
                }));
            }).fail(function (data) {
                alert('error');
            });
        },
        select: (event, ui) => {
            let redirect = ui.item.label.replace(/ /g,"-");
            redirect = encodeURIComponent(redirect);
            console.log(redirect);
            window.location.href = `/finanse/produkt/${redirect}`;
        }
    }); 
});
