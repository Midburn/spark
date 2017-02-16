$(document).ready(function() {
    var $dataTable = $('.dataTable');
    var columns = [];
    $dataTable.find('thead > tr > th').each(function() {
        columns.push({data: $(this).data('attr')});
    });
    var options = $dataTable.data('table-options');
    if (!options) options = {};
    var dataTable = $dataTable
        .on('init.dt', function () {
            $('#datatable-admin table.dataTable tr td:last-child').each(function(i) {
                var id = dataTable.data()[i][options.editKey]; //.text();
                $(this).html("<a href='"+options.editUrl.replace('{id}', id)+"' class='btn btn-info btn-xs'><i class='fa fa-pencil'></i> Edit </a>");
            });
        })
        .DataTable({
            "ajax": $dataTable.data('table-ajax'),
            // "processing": true,
            "serverSide": true,
            "columns": columns,
            "lengthMenu": options.lengthMenu, // the options in the page length select list
            "pageLength": options.pageLength, // initial page length (number of rows per page)
            "order": options.order
        })
    ;
    // NOT IN USE. UNCOMMENT WHEN NEEDED
    // var $addButton = $('#datatable-admin .add').click(function() {
    //     window.location.href = options.addUrl;
    // });
});
