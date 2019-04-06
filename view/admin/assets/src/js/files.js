$(function() {
  $("#files_table").on("click", ".delete-file", function(e) {
    e.preventDefault();

    var me = $(this);
    var id = me.attr("id");

    alertify.confirm("Are you sure you want to delete this file?", function() {
      $.ajax({
        type: "delete",
        url: "/admin/files/?id=" + id,
        success: function(json) {
          if (json.status === "success") {
            me.parent()
              .parent()
              .remove();
            alertify.success("File deleted");
          } else {
            alert(json.msg);
          }
        }
      });
    });
  });
});

window.listenDigSelectEvent = function () {
  $(".dig-select").change(function(){
    var id = $(this).attr("id");
    var val=$(this).find('option:selected').val();
    $.ajax({
      type: "post",
      url: "/admin/files/gallery_status",
      data: `id=${id}&val=${val}`,
      success: function(json) {
        if (json.status === "success") {
          alertify.success(`change id ${id} success`);
        } else {
          alert(json.msg);
        }
      }
    });
  })
}

$(function() {
  listenDigSelectEvent()
});
