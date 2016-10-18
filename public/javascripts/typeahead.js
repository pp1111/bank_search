$(document).ready(function () {
    $('#searcharea').autocomplete({
        source: (req, res) => {
            $.ajax({
                url: "http://localhost:4000/search/suggestions?q=" + req.term.replace(/ /g,"_"),
                dataType: "jsonp",
                type: "GET",
                data: {
                    term: req.term
                }
            }).done((data) =>{
                res($.map(data, (item) =>{
                    item.term = item.term.replace(/<b>/g, "");
                    item.term = item.term.replace(/<\/b>/g, "")
                    return {
                        value: item.term.replace(/_/g," ")
                    };
                }));
            }).fail(function (data) {
                alert('error');
            });
        },
        select: (event, ui) => {
            $('#searcharea').val(ui.item.label);
            $('#search').click();
        }
    }); 
});