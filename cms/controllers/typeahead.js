$(document).ready(function () {
    $('#searcharea').autocomplete({
        source: (req, res) => {
            $.ajax({
                url: "http://localhost:4000/search/data?q=" + decodeURIComponent(req.term.replace(/ /g,"-")),
                dataType: "jsonp",
                type: "GET",
                data: {
                    term: req.term
                }
            }).done((data) =>{
                data = data.response.docs;
                res($.map(data, (item) =>{
                    return {
                        value: item.value.replace(/-/g," "),
                        id: item._id,
                    };
                }));
            }).fail(function (data) {
                alert('error');
            });
        },
        select: (event, ui) => {
            window.location.href = `/selected/${ui.item.id}`;
        }
    });

    $("#searcharea").autocomplete("search");
});
