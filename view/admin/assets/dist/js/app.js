/**
 * Created by Kupletsky Sergey on 17.10.14.
 *
 * Material Sidebar (Profile menu)
 * Tested on Win8.1 with browsers: Chrome 37, Firefox 32, Opera 25, IE 11, Safari 5.1.7
 * You can use this sidebar in Bootstrap (v3) projects. HTML-markup like Navbar bootstrap component will make your work easier.
 * Dropdown menu and sidebar toggle button works with JQuery and Bootstrap.min.js
 */

// Sidebar toggle
//
// -------------------
$(document).ready(function() {
    var overlay = $('.sidebar-overlay');

    $('.sidebar-toggle').on('click', function() {
        var sidebar = $('#sidebar');
        sidebar.toggleClass('open');
        if ((sidebar.hasClass('sidebar-fixed-left') || sidebar.hasClass('sidebar-fixed-right')) && sidebar.hasClass('open')) {
            overlay.addClass('active');
        } else {
            overlay.removeClass('active');
        }
    });

    overlay.on('click', function() {
        $(this).removeClass('active');
        $('#sidebar').removeClass('open');
    });

});

// Sidebar constructor
//
// -------------------
$(document).ready(function() {

    var sidebar = $('#sidebar');
    var sidebarHeader = $('#sidebar .sidebar-header');
    var sidebarImg = sidebarHeader.css('background-image');
    var toggleButtons = $('.sidebar-toggle');

    // Hide toggle buttons on default position
    toggleButtons.css('display', 'none');
    $('body').css('display', 'table');


    // Sidebar position
    $('#sidebar-position').change(function() {
        var value = $( this ).val();
        sidebar.removeClass('sidebar-fixed-left sidebar-fixed-right sidebar-stacked').addClass(value).addClass('open');
        if (value == 'sidebar-fixed-left' || value == 'sidebar-fixed-right') {
            $('.sidebar-overlay').addClass('active');
        }
        // Show toggle buttons
        if (value != '') {
            toggleButtons.css('display', 'initial');
            $('body').css('display', 'initial');
        } else {
            // Hide toggle buttons
            toggleButtons.css('display', 'none');
            $('body').css('display', 'table');
        }
    });

    // Sidebar theme
    $('#sidebar-theme').change(function() {
        var value = $( this ).val();
        sidebar.removeClass('sidebar-default sidebar-inverse sidebar-colored sidebar-colored-inverse').addClass(value)
    });

    // Header cover
    $('#sidebar-header').change(function() {
        var value = $(this).val();

        $('.sidebar-header').removeClass('header-cover').addClass(value);

        if (value == 'header-cover') {
            sidebarHeader.css('background-image', sidebarImg)
        } else {
            sidebarHeader.css('background-image', '')
        }
    });
});

/**
 * Created by Kupletsky Sergey on 08.09.14.
 *
 * Add JQuery animation to bootstrap dropdown elements.
 */

(function($) {
    var dropdown = $('.dropdown');

    // Add slidedown animation to dropdown
    dropdown.on('show.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown();
    });

    // Add slideup animation to dropdown
    dropdown.on('hide.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp();
    });
})(jQuery);



(function(removeClass) {

	jQuery.fn.removeClass = function( value ) {
		if ( value && typeof value.test === "function" ) {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				var elem = this[i];
				if ( elem.nodeType === 1 && elem.className ) {
					var classNames = elem.className.split( /\s+/ );

					for ( var n = classNames.length; n--; ) {
						if ( value.test(classNames[n]) ) {
							classNames.splice(n, 1);
						}
					}
					elem.className = jQuery.trim( classNames.join(" ") );
				}
			}
		} else {
			removeClass.call(this, value);
		}
		return this;
	}

})(jQuery.fn.removeClass);

$(function () {
    $('.comment-delete').on("click", function () {
        var comment = $(this);
        alertify.confirm("Are you sure you want to delete this post?", function() {
            var id = comment.attr("rel");
            $.ajax({
                type: "delete",
                url: "/admin/comments/?id=" + id,
                success: function (json) {
                    alertify.success("Comment delted");
                    $('#comment-' + id).remove();
                },
                error: function (json) {
                    alertify.error(("Error: " + JSON.parse(json.responseText).msg));
                }
            });
        });
    });
    $('.comment-approve').on("click", function () {
        var comment = $(this);
        var id = $(this).attr("rel");
        $.ajax({
            type: "put",
            url: "/admin/comments/?id=" + id,
            "success":function(json){
                if(json.status === "success"){
                    alertify.success("Comment approved");
                    comment.removeClass("comment-approve").removeClass("mdl-color-text--green").addClass("disabled").attr("disabled", true);
                    comment.unbind();
                }else{
                    alertify.error(("Error: " + JSON.parse(json.responseText).msg));
                }
            }
        });
        return false;
    });
    $('.comment-reply').on("click",function(){
        var id = $(this).attr("rel");
        $('#comment-'+id).after($('#comment-block').detach().show());
        $('#comment-parent').val(id);
        return false;
    });
    $('#comment-form').ajaxForm({
        success: function (json) {
            alertify.success("Succesfully replied");
            window.location.href = "/admin/comments/";
        },
        error: function (json) {
            alertify.error(("Error: " + JSON.parse(json.responseText).msg));
        }
    });
    $('#comment-close').on("click",function(){
        $('#comment-block').hide();
        $('#comment-parent').val(0);
        $('#comment-content').val("");
    });
});

$(function () {
  new FormValidator("post-form", [
      {"name": "slug", "rules": "alpha_dash"}
  ], function (errors, e) {
    e.preventDefault();
    $('.invalid').hide();
    if (errors.length) {
      $("#" + errors[0].id + "-invalid").removeClass("hide").show();
      return;
    }
    $('#post-form').ajaxSubmit({
    success: function (json) {
      if (json.status === "success") {
        alertify.success("Content saved", 'success');
        window.history.pushState({}, "", "/admin/editor/" + json.content.Id + "/");
      } else {
        alertify.error(json.msg);
      }
    },
    error: function (json) {
        alertify.error(("Error: " + JSON.parse(json.responseText).msg));
    }
    });
  });
  initUpload("#post-information");
});

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
    console.log(123)
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

$(function () {
  new FormValidator("login-form", [
      {"name": "password", "rules": "required|min_length[4]|max_length[20]"}
  ], function (errors, e) {
    e.preventDefault();
    $('.invalid').hide();
    if (errors.length) {
      $("#" + errors[0].id + "-invalid").removeClass("hide").show();
      return;
    }

    $('#login-form').ajaxSubmit({
      dataType: "json",
      success: function (json) {
        if (json.status === "error") {
          alertify.error("Incorrect username & password combination.");
        } else {
          window.location.href = "/admin/";
        }
      }
    });
  })
});

$(function(){
  new FormValidator("password-form",[
      {"name":"old","rules":"min_length[2]|max_length[20]"},
      {"name":"new","rules":"min_length[2]|max_length[20]"},
      {"name":"confirm","rules":"required|matches[new]"}
  ],function(errors,e){
    e.preventDefault();
    $('.invalid').hide();
    if(errors.length){
      $("#"+errors[0].id+"-invalid").removeClass("hide").show();
      return;
    }
    $('#password').ajaxSubmit({
      "success": function() {
        alertify.success("Password changed");
      },
      "error": function() {
        alertify.error(("Error: " + JSON.parse(json.responseText).msg));
      }
    });
  })
});

$(".delete-post").on("click",function(e){
  e.preventDefault();
  var id = $(this).attr("rel");
  alertify.confirm("Are you sure you want to delete this post?", function() {
    $.ajax({
      "url":"/admin/editor/"+id+"/",
      "type":"delete",
      "success":function(json){
        if(json.status === "success"){
          alertify.success("Post deleted");
          $('#dingo-post-' + id).remove();
        }else{
          alertify.error((JSON.parse(json.responseText).msg));
        }
      }
    });
  });
});


$(function(){
    new FormValidator("profile-form",[
        {"name":"slug","rules":"alpha_numeric|min_length[1]|max_length[20]"},
        {"name":"email","rules":"valid_email"},
        {"name":"url","rules":"valid_url"}
    ],function(errors,e) {
        e.preventDefault();
        $('.invalid').hide();
        if(errors.length){
            $("#"+errors[0].id+"-invalid").removeClass("hide").show();
            return;
        }
        $('#profile').ajaxSubmit(function(json){
            if(json.status === "error"){
                alert(json.msg);
            }else{
                alertify.success("Profile saved")
            }
            return false;
        });
    })
});

$(function () {
    $('.setting-form').ajaxForm({
        'success': function() {
            alertify.success("Saved");
        },
        'error': function() {
            alertify.error(("Error: " + JSON.parse(json.responseText).msg));
        }
    });
    $("#add-custom").on("click", function(e) {
        e.preventDefault();
        $("#custom-settings").append($($(this).attr("rel")).html());
        componentHandler.upgradeDom();
    });
    $("#add-nav").on("click", function(e) {
        e.preventDefault();
        $("#navigators").append($($(this).attr("rel")).html());
        componentHandler.upgradeDom();

    });
    $('.setting-form').on("click", ".del-nav", function(e) {
        e.preventDefault();
        console.log($(this).parent().parent());
        var item = $(this).parent().parent()
        alertify.confirm("Delete this item?", function() {
            item.remove();
        });
    });
    $('.setting-form').on("click", ".del-custom", function(e) {
        e.preventDefault();
        var item = $(this).parent().parent()
        alertify.confirm("Delete this item?", function() {
            item.remove();
        });
    });
})

$(function () {
    new FormValidator("signup-form", [
        {"name": "name", "rules": "required"},
        {"name": "email", "rules": "required"},
        {"name": "password", "rules": "required|min_length[4]|max_length[20]"}
    ], function (errors, e) {
        e.preventDefault();
        if (errors.length) {
            alertify.error("Error: " + errors[0].message);
            return;
        }
        $('#signup-form').ajaxSubmit({
            success: function (json) {
                window.location.href = "/admin/";
            },
            error: function (json) {
                alertify.error(("Error: " + JSON.parse(json.responseText).msg));
            }
        });
    })
});

function editorAction(json) {
    var cm = $('.CodeMirror')[0].CodeMirror;
    var doc = cm.getDoc();
    doc.replaceSelections(["![](/" + json.file.url + ")"]);
}

function filesAction(json) {
    var $fileLine = $('<tr id="file-' + json.file.name + '">' 
        + '<td class="mdl-data-table__cell--non-numeric">' + json.file.time + '</td>'
        // + '<td class="mdl-data-table__cell--non-numeric">' + json.file.size + '</td>'
        + '<td class="mdl-data-table__cell--non-numeric">' + json.file.name + '</td>'
        + '<td class="mdl-data-table__cell--non-numeric">'
          + '<img class="admin-thumbnail" src="/' + json.file.url + '" alt="">'
        + '</td>'
        + '<td class="mdl-data-table__cell--non-numeric">' + json.file.type + '</td>'
        +` <td class="mdl-data-table__cell--non-numeric">
            <select class="dig-select" id="${json.file.id}">
              <option ${json.is_show_on_gallery ? 'selected'  : ''} value ="true">true</option>
              <option ${json.is_show_on_gallery ? ''  : 'selected'} value ="false">false</option>
            </select>
        </td>`

        + '<td class="mdl-data-table__cell--non-numeric">'
          + '<a class="btn btn-small blue" href="/'+ json.file.url +'" target="_blank" title="/' + json.file.name + '">View</a>&nbsp;'
          + '<a class="btn btn-small red delete-file" href="#" name="' + json.file.name + '" rel="' + json.file.url + '" title="Delete">Delete</a>'
        + '</td></tr>');
    $('tbody').prepend($fileLine);
    window.listenDigSelectEvent()
}

function initUpload(p) {
    $('#attach-show').on("click", function() {
        $('#attach-upload').trigger("click");
    });
    $('#attach-upload').on("change", function () {
        alertify.confirm("Upload now?", function() {
            var bar = $('<p class="file-progress inline-block">0%</p>');
            $('#attach-form').ajaxSubmit({
                "beforeSubmit": function () {
                    $(p).before(bar);
                },
                "uploadProgress": function (event, position, total, percentComplete) {
                    var percentVal = percentComplete + '%';
                    bar.css("width", percentVal).html(percentVal);
                },
                "success": function (json) {
                    $('#attach-upload').val("");
                    if (json.status === "error") {
                        bar.html(json.msg).addClass("err");
                        setTimeout(function () {
                            bar.remove();
                        }, 5000);
                        return
                    }
                    
                    alertify.success("File has been uploaded.")
                    bar.html("/" + json.file.url + "&nbsp;&nbsp;&nbsp;(@" + json.file.name + ")");                    
                    if ($('.CodeMirror').length == 0) {
                        filesAction(json);
                    } else {
                        editorAction(json);
                    }
                }
            });
        }, function() {
            $(this).val("");
        });
    });
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbW1lbnRzLmpzIiwiZWRpdG9yLmpzIiwiZmlsZXMuanMiLCJsb2dpbi5qcyIsInBhc3N3b3JkLmpzIiwicG9zdHMuanMiLCJwcm9maWxlLmpzIiwic2V0dGluZ3MuanMiLCJzaWdudXAuanMiLCJ1cGxvYWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgS3VwbGV0c2t5IFNlcmdleSBvbiAxNy4xMC4xNC5cbiAqXG4gKiBNYXRlcmlhbCBTaWRlYmFyIChQcm9maWxlIG1lbnUpXG4gKiBUZXN0ZWQgb24gV2luOC4xIHdpdGggYnJvd3NlcnM6IENocm9tZSAzNywgRmlyZWZveCAzMiwgT3BlcmEgMjUsIElFIDExLCBTYWZhcmkgNS4xLjdcbiAqIFlvdSBjYW4gdXNlIHRoaXMgc2lkZWJhciBpbiBCb290c3RyYXAgKHYzKSBwcm9qZWN0cy4gSFRNTC1tYXJrdXAgbGlrZSBOYXZiYXIgYm9vdHN0cmFwIGNvbXBvbmVudCB3aWxsIG1ha2UgeW91ciB3b3JrIGVhc2llci5cbiAqIERyb3Bkb3duIG1lbnUgYW5kIHNpZGViYXIgdG9nZ2xlIGJ1dHRvbiB3b3JrcyB3aXRoIEpRdWVyeSBhbmQgQm9vdHN0cmFwLm1pbi5qc1xuICovXG5cbi8vIFNpZGViYXIgdG9nZ2xlXG4vL1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgdmFyIG92ZXJsYXkgPSAkKCcuc2lkZWJhci1vdmVybGF5Jyk7XG5cbiAgICAkKCcuc2lkZWJhci10b2dnbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNpZGViYXIgPSAkKCcjc2lkZWJhcicpO1xuICAgICAgICBzaWRlYmFyLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgIGlmICgoc2lkZWJhci5oYXNDbGFzcygnc2lkZWJhci1maXhlZC1sZWZ0JykgfHwgc2lkZWJhci5oYXNDbGFzcygnc2lkZWJhci1maXhlZC1yaWdodCcpKSAmJiBzaWRlYmFyLmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAgICAgICAgIG92ZXJsYXkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3ZlcmxheS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIG92ZXJsYXkub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAkKCcjc2lkZWJhcicpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgfSk7XG5cbn0pO1xuXG4vLyBTaWRlYmFyIGNvbnN0cnVjdG9yXG4vL1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2lkZWJhciA9ICQoJyNzaWRlYmFyJyk7XG4gICAgdmFyIHNpZGViYXJIZWFkZXIgPSAkKCcjc2lkZWJhciAuc2lkZWJhci1oZWFkZXInKTtcbiAgICB2YXIgc2lkZWJhckltZyA9IHNpZGViYXJIZWFkZXIuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJyk7XG4gICAgdmFyIHRvZ2dsZUJ1dHRvbnMgPSAkKCcuc2lkZWJhci10b2dnbGUnKTtcblxuICAgIC8vIEhpZGUgdG9nZ2xlIGJ1dHRvbnMgb24gZGVmYXVsdCBwb3NpdGlvblxuICAgIHRvZ2dsZUJ1dHRvbnMuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAkKCdib2R5JykuY3NzKCdkaXNwbGF5JywgJ3RhYmxlJyk7XG5cblxuICAgIC8vIFNpZGViYXIgcG9zaXRpb25cbiAgICAkKCcjc2lkZWJhci1wb3NpdGlvbicpLmNoYW5nZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gJCggdGhpcyApLnZhbCgpO1xuICAgICAgICBzaWRlYmFyLnJlbW92ZUNsYXNzKCdzaWRlYmFyLWZpeGVkLWxlZnQgc2lkZWJhci1maXhlZC1yaWdodCBzaWRlYmFyLXN0YWNrZWQnKS5hZGRDbGFzcyh2YWx1ZSkuYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgaWYgKHZhbHVlID09ICdzaWRlYmFyLWZpeGVkLWxlZnQnIHx8IHZhbHVlID09ICdzaWRlYmFyLWZpeGVkLXJpZ2h0Jykge1xuICAgICAgICAgICAgJCgnLnNpZGViYXItb3ZlcmxheScpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTaG93IHRvZ2dsZSBidXR0b25zXG4gICAgICAgIGlmICh2YWx1ZSAhPSAnJykge1xuICAgICAgICAgICAgdG9nZ2xlQnV0dG9ucy5jc3MoJ2Rpc3BsYXknLCAnaW5pdGlhbCcpO1xuICAgICAgICAgICAgJCgnYm9keScpLmNzcygnZGlzcGxheScsICdpbml0aWFsJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBIaWRlIHRvZ2dsZSBidXR0b25zXG4gICAgICAgICAgICB0b2dnbGVCdXR0b25zLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgICAgICAkKCdib2R5JykuY3NzKCdkaXNwbGF5JywgJ3RhYmxlJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFNpZGViYXIgdGhlbWVcbiAgICAkKCcjc2lkZWJhci10aGVtZScpLmNoYW5nZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gJCggdGhpcyApLnZhbCgpO1xuICAgICAgICBzaWRlYmFyLnJlbW92ZUNsYXNzKCdzaWRlYmFyLWRlZmF1bHQgc2lkZWJhci1pbnZlcnNlIHNpZGViYXItY29sb3JlZCBzaWRlYmFyLWNvbG9yZWQtaW52ZXJzZScpLmFkZENsYXNzKHZhbHVlKVxuICAgIH0pO1xuXG4gICAgLy8gSGVhZGVyIGNvdmVyXG4gICAgJCgnI3NpZGViYXItaGVhZGVyJykuY2hhbmdlKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xuXG4gICAgICAgICQoJy5zaWRlYmFyLWhlYWRlcicpLnJlbW92ZUNsYXNzKCdoZWFkZXItY292ZXInKS5hZGRDbGFzcyh2YWx1ZSk7XG5cbiAgICAgICAgaWYgKHZhbHVlID09ICdoZWFkZXItY292ZXInKSB7XG4gICAgICAgICAgICBzaWRlYmFySGVhZGVyLmNzcygnYmFja2dyb3VuZC1pbWFnZScsIHNpZGViYXJJbWcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaWRlYmFySGVhZGVyLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICcnKVxuICAgICAgICB9XG4gICAgfSk7XG59KTtcblxuLyoqXG4gKiBDcmVhdGVkIGJ5IEt1cGxldHNreSBTZXJnZXkgb24gMDguMDkuMTQuXG4gKlxuICogQWRkIEpRdWVyeSBhbmltYXRpb24gdG8gYm9vdHN0cmFwIGRyb3Bkb3duIGVsZW1lbnRzLlxuICovXG5cbihmdW5jdGlvbigkKSB7XG4gICAgdmFyIGRyb3Bkb3duID0gJCgnLmRyb3Bkb3duJyk7XG5cbiAgICAvLyBBZGQgc2xpZGVkb3duIGFuaW1hdGlvbiB0byBkcm9wZG93blxuICAgIGRyb3Bkb3duLm9uKCdzaG93LmJzLmRyb3Bkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICQodGhpcykuZmluZCgnLmRyb3Bkb3duLW1lbnUnKS5maXJzdCgpLnN0b3AodHJ1ZSwgdHJ1ZSkuc2xpZGVEb3duKCk7XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgc2xpZGV1cCBhbmltYXRpb24gdG8gZHJvcGRvd25cbiAgICBkcm9wZG93bi5vbignaGlkZS5icy5kcm9wZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAkKHRoaXMpLmZpbmQoJy5kcm9wZG93bi1tZW51JykuZmlyc3QoKS5zdG9wKHRydWUsIHRydWUpLnNsaWRlVXAoKTtcbiAgICB9KTtcbn0pKGpRdWVyeSk7XG5cblxuXG4oZnVuY3Rpb24ocmVtb3ZlQ2xhc3MpIHtcblxuXHRqUXVlcnkuZm4ucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiggdmFsdWUgKSB7XG5cdFx0aWYgKCB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudGVzdCA9PT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0Zm9yICggdmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKysgKSB7XG5cdFx0XHRcdHZhciBlbGVtID0gdGhpc1tpXTtcblx0XHRcdFx0aWYgKCBlbGVtLm5vZGVUeXBlID09PSAxICYmIGVsZW0uY2xhc3NOYW1lICkge1xuXHRcdFx0XHRcdHZhciBjbGFzc05hbWVzID0gZWxlbS5jbGFzc05hbWUuc3BsaXQoIC9cXHMrLyApO1xuXG5cdFx0XHRcdFx0Zm9yICggdmFyIG4gPSBjbGFzc05hbWVzLmxlbmd0aDsgbi0tOyApIHtcblx0XHRcdFx0XHRcdGlmICggdmFsdWUudGVzdChjbGFzc05hbWVzW25dKSApIHtcblx0XHRcdFx0XHRcdFx0Y2xhc3NOYW1lcy5zcGxpY2UobiwgMSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsZW0uY2xhc3NOYW1lID0galF1ZXJ5LnRyaW0oIGNsYXNzTmFtZXMuam9pbihcIiBcIikgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZW1vdmVDbGFzcy5jYWxsKHRoaXMsIHZhbHVlKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxufSkoalF1ZXJ5LmZuLnJlbW92ZUNsYXNzKTtcbiIsIiQoZnVuY3Rpb24gKCkge1xuICAgICQoJy5jb21tZW50LWRlbGV0ZScpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY29tbWVudCA9ICQodGhpcyk7XG4gICAgICAgIGFsZXJ0aWZ5LmNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgcG9zdD9cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgaWQgPSBjb21tZW50LmF0dHIoXCJyZWxcIik7XG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZGVsZXRlXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hZG1pbi9jb21tZW50cy8/aWQ9XCIgKyBpZCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiQ29tbWVudCBkZWx0ZWRcIik7XG4gICAgICAgICAgICAgICAgICAgICQoJyNjb21tZW50LScgKyBpZCkucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnRpZnkuZXJyb3IoKFwiRXJyb3I6IFwiICsgSlNPTi5wYXJzZShqc29uLnJlc3BvbnNlVGV4dCkubXNnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgICQoJy5jb21tZW50LWFwcHJvdmUnKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNvbW1lbnQgPSAkKHRoaXMpO1xuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoXCJyZWxcIik7XG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB0eXBlOiBcInB1dFwiLFxuICAgICAgICAgICAgdXJsOiBcIi9hZG1pbi9jb21tZW50cy8/aWQ9XCIgKyBpZCxcbiAgICAgICAgICAgIFwic3VjY2Vzc1wiOmZ1bmN0aW9uKGpzb24pe1xuICAgICAgICAgICAgICAgIGlmKGpzb24uc3RhdHVzID09PSBcInN1Y2Nlc3NcIil7XG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJDb21tZW50IGFwcHJvdmVkXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb21tZW50LnJlbW92ZUNsYXNzKFwiY29tbWVudC1hcHByb3ZlXCIpLnJlbW92ZUNsYXNzKFwibWRsLWNvbG9yLXRleHQtLWdyZWVuXCIpLmFkZENsYXNzKFwiZGlzYWJsZWRcIikuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBjb21tZW50LnVuYmluZCgpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBhbGVydGlmeS5lcnJvcigoXCJFcnJvcjogXCIgKyBKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG4gICAgJCgnLmNvbW1lbnQtcmVwbHknKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGlkID0gJCh0aGlzKS5hdHRyKFwicmVsXCIpO1xuICAgICAgICAkKCcjY29tbWVudC0nK2lkKS5hZnRlcigkKCcjY29tbWVudC1ibG9jaycpLmRldGFjaCgpLnNob3coKSk7XG4gICAgICAgICQoJyNjb21tZW50LXBhcmVudCcpLnZhbChpZCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbiAgICAkKCcjY29tbWVudC1mb3JtJykuYWpheEZvcm0oe1xuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIlN1Y2Nlc2Z1bGx5IHJlcGxpZWRcIik7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2FkbWluL2NvbW1lbnRzL1wiO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgIGFsZXJ0aWZ5LmVycm9yKChcIkVycm9yOiBcIiArIEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgJCgnI2NvbW1lbnQtY2xvc2UnKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oKXtcbiAgICAgICAgJCgnI2NvbW1lbnQtYmxvY2snKS5oaWRlKCk7XG4gICAgICAgICQoJyNjb21tZW50LXBhcmVudCcpLnZhbCgwKTtcbiAgICAgICAgJCgnI2NvbW1lbnQtY29udGVudCcpLnZhbChcIlwiKTtcbiAgICB9KTtcbn0pO1xuIiwiJChmdW5jdGlvbiAoKSB7XG4gIG5ldyBGb3JtVmFsaWRhdG9yKFwicG9zdC1mb3JtXCIsIFtcbiAgICAgIHtcIm5hbWVcIjogXCJzbHVnXCIsIFwicnVsZXNcIjogXCJhbHBoYV9kYXNoXCJ9XG4gIF0sIGZ1bmN0aW9uIChlcnJvcnMsIGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnLmludmFsaWQnKS5oaWRlKCk7XG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgICQoXCIjXCIgKyBlcnJvcnNbMF0uaWQgKyBcIi1pbnZhbGlkXCIpLnJlbW92ZUNsYXNzKFwiaGlkZVwiKS5zaG93KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgICQoJyNwb3N0LWZvcm0nKS5hamF4U3VibWl0KHtcbiAgICBzdWNjZXNzOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgaWYgKGpzb24uc3RhdHVzID09PSBcInN1Y2Nlc3NcIikge1xuICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiQ29udGVudCBzYXZlZFwiLCAnc3VjY2VzcycpO1xuICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoe30sIFwiXCIsIFwiL2FkbWluL2VkaXRvci9cIiArIGpzb24uY29udGVudC5JZCArIFwiL1wiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFsZXJ0aWZ5LmVycm9yKGpzb24ubXNnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICBhbGVydGlmeS5lcnJvcigoXCJFcnJvcjogXCIgKyBKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICB9XG4gICAgfSk7XG4gIH0pO1xuICBpbml0VXBsb2FkKFwiI3Bvc3QtaW5mb3JtYXRpb25cIik7XG59KTtcbiIsIiQoZnVuY3Rpb24oKSB7XG4gICQoXCIjZmlsZXNfdGFibGVcIikub24oXCJjbGlja1wiLCBcIi5kZWxldGUtZmlsZVwiLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyIG1lID0gJCh0aGlzKTtcbiAgICB2YXIgaWQgPSBtZS5hdHRyKFwiaWRcIik7XG5cbiAgICBhbGVydGlmeS5jb25maXJtKFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSB0aGlzIGZpbGU/XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgJC5hamF4KHtcbiAgICAgICAgdHlwZTogXCJkZWxldGVcIixcbiAgICAgICAgdXJsOiBcIi9hZG1pbi9maWxlcy8/aWQ9XCIgKyBpZCxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oanNvbikge1xuICAgICAgICAgIGlmIChqc29uLnN0YXR1cyA9PT0gXCJzdWNjZXNzXCIpIHtcbiAgICAgICAgICAgIG1lLnBhcmVudCgpXG4gICAgICAgICAgICAgIC5wYXJlbnQoKVxuICAgICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiRmlsZSBkZWxldGVkXCIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbGVydChqc29uLm1zZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KTtcblxud2luZG93Lmxpc3RlbkRpZ1NlbGVjdEV2ZW50ID0gZnVuY3Rpb24gKCkge1xuICAkKFwiLmRpZy1zZWxlY3RcIikuY2hhbmdlKGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS5sb2coMTIzKVxuICAgIHZhciBpZCA9ICQodGhpcykuYXR0cihcImlkXCIpO1xuICAgIHZhciB2YWw9JCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS52YWwoKTtcbiAgICAkLmFqYXgoe1xuICAgICAgdHlwZTogXCJwb3N0XCIsXG4gICAgICB1cmw6IFwiL2FkbWluL2ZpbGVzL2dhbGxlcnlfc3RhdHVzXCIsXG4gICAgICBkYXRhOiBgaWQ9JHtpZH0mdmFsPSR7dmFsfWAsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihqc29uKSB7XG4gICAgICAgIGlmIChqc29uLnN0YXR1cyA9PT0gXCJzdWNjZXNzXCIpIHtcbiAgICAgICAgICBhbGVydGlmeS5zdWNjZXNzKGBjaGFuZ2UgaWQgJHtpZH0gc3VjY2Vzc2ApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFsZXJ0KGpzb24ubXNnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9KVxufVxuXG4kKGZ1bmN0aW9uKCkge1xuICBsaXN0ZW5EaWdTZWxlY3RFdmVudCgpXG59KTtcbiIsIiQoZnVuY3Rpb24gKCkge1xuICBuZXcgRm9ybVZhbGlkYXRvcihcImxvZ2luLWZvcm1cIiwgW1xuICAgICAge1wibmFtZVwiOiBcInBhc3N3b3JkXCIsIFwicnVsZXNcIjogXCJyZXF1aXJlZHxtaW5fbGVuZ3RoWzRdfG1heF9sZW5ndGhbMjBdXCJ9XG4gIF0sIGZ1bmN0aW9uIChlcnJvcnMsIGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnLmludmFsaWQnKS5oaWRlKCk7XG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgICQoXCIjXCIgKyBlcnJvcnNbMF0uaWQgKyBcIi1pbnZhbGlkXCIpLnJlbW92ZUNsYXNzKFwiaGlkZVwiKS5zaG93KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJCgnI2xvZ2luLWZvcm0nKS5hamF4U3VibWl0KHtcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgIGlmIChqc29uLnN0YXR1cyA9PT0gXCJlcnJvclwiKSB7XG4gICAgICAgICAgYWxlcnRpZnkuZXJyb3IoXCJJbmNvcnJlY3QgdXNlcm5hbWUgJiBwYXNzd29yZCBjb21iaW5hdGlvbi5cIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9hZG1pbi9cIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9KVxufSk7XG4iLCIkKGZ1bmN0aW9uKCl7XG4gIG5ldyBGb3JtVmFsaWRhdG9yKFwicGFzc3dvcmQtZm9ybVwiLFtcbiAgICAgIHtcIm5hbWVcIjpcIm9sZFwiLFwicnVsZXNcIjpcIm1pbl9sZW5ndGhbMl18bWF4X2xlbmd0aFsyMF1cIn0sXG4gICAgICB7XCJuYW1lXCI6XCJuZXdcIixcInJ1bGVzXCI6XCJtaW5fbGVuZ3RoWzJdfG1heF9sZW5ndGhbMjBdXCJ9LFxuICAgICAge1wibmFtZVwiOlwiY29uZmlybVwiLFwicnVsZXNcIjpcInJlcXVpcmVkfG1hdGNoZXNbbmV3XVwifVxuICBdLGZ1bmN0aW9uKGVycm9ycyxlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJCgnLmludmFsaWQnKS5oaWRlKCk7XG4gICAgaWYoZXJyb3JzLmxlbmd0aCl7XG4gICAgICAkKFwiI1wiK2Vycm9yc1swXS5pZCtcIi1pbnZhbGlkXCIpLnJlbW92ZUNsYXNzKFwiaGlkZVwiKS5zaG93KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgICQoJyNwYXNzd29yZCcpLmFqYXhTdWJtaXQoe1xuICAgICAgXCJzdWNjZXNzXCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiUGFzc3dvcmQgY2hhbmdlZFwiKTtcbiAgICAgIH0sXG4gICAgICBcImVycm9yXCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBhbGVydGlmeS5lcnJvcigoXCJFcnJvcjogXCIgKyBKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcbn0pO1xuIiwiJChcIi5kZWxldGUtcG9zdFwiKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oZSl7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgdmFyIGlkID0gJCh0aGlzKS5hdHRyKFwicmVsXCIpO1xuICBhbGVydGlmeS5jb25maXJtKFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSB0aGlzIHBvc3Q/XCIsIGZ1bmN0aW9uKCkge1xuICAgICQuYWpheCh7XG4gICAgICBcInVybFwiOlwiL2FkbWluL2VkaXRvci9cIitpZCtcIi9cIixcbiAgICAgIFwidHlwZVwiOlwiZGVsZXRlXCIsXG4gICAgICBcInN1Y2Nlc3NcIjpmdW5jdGlvbihqc29uKXtcbiAgICAgICAgaWYoanNvbi5zdGF0dXMgPT09IFwic3VjY2Vzc1wiKXtcbiAgICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiUG9zdCBkZWxldGVkXCIpO1xuICAgICAgICAgICQoJyNkaW5nby1wb3N0LScgKyBpZCkucmVtb3ZlKCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGFsZXJ0aWZ5LmVycm9yKChKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn0pO1xuXG4iLCIkKGZ1bmN0aW9uKCl7XG4gICAgbmV3IEZvcm1WYWxpZGF0b3IoXCJwcm9maWxlLWZvcm1cIixbXG4gICAgICAgIHtcIm5hbWVcIjpcInNsdWdcIixcInJ1bGVzXCI6XCJhbHBoYV9udW1lcmljfG1pbl9sZW5ndGhbMV18bWF4X2xlbmd0aFsyMF1cIn0sXG4gICAgICAgIHtcIm5hbWVcIjpcImVtYWlsXCIsXCJydWxlc1wiOlwidmFsaWRfZW1haWxcIn0sXG4gICAgICAgIHtcIm5hbWVcIjpcInVybFwiLFwicnVsZXNcIjpcInZhbGlkX3VybFwifVxuICAgIF0sZnVuY3Rpb24oZXJyb3JzLGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkKCcuaW52YWxpZCcpLmhpZGUoKTtcbiAgICAgICAgaWYoZXJyb3JzLmxlbmd0aCl7XG4gICAgICAgICAgICAkKFwiI1wiK2Vycm9yc1swXS5pZCtcIi1pbnZhbGlkXCIpLnJlbW92ZUNsYXNzKFwiaGlkZVwiKS5zaG93KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJCgnI3Byb2ZpbGUnKS5hamF4U3VibWl0KGZ1bmN0aW9uKGpzb24pe1xuICAgICAgICAgICAgaWYoanNvbi5zdGF0dXMgPT09IFwiZXJyb3JcIil7XG4gICAgICAgICAgICAgICAgYWxlcnQoanNvbi5tc2cpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIlByb2ZpbGUgc2F2ZWRcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfSlcbn0pO1xuIiwiJChmdW5jdGlvbiAoKSB7XG4gICAgJCgnLnNldHRpbmctZm9ybScpLmFqYXhGb3JtKHtcbiAgICAgICAgJ3N1Y2Nlc3MnOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJTYXZlZFwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgJ2Vycm9yJzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhbGVydGlmeS5lcnJvcigoXCJFcnJvcjogXCIgKyBKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgICQoXCIjYWRkLWN1c3RvbVwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkKFwiI2N1c3RvbS1zZXR0aW5nc1wiKS5hcHBlbmQoJCgkKHRoaXMpLmF0dHIoXCJyZWxcIikpLmh0bWwoKSk7XG4gICAgICAgIGNvbXBvbmVudEhhbmRsZXIudXBncmFkZURvbSgpO1xuICAgIH0pO1xuICAgICQoXCIjYWRkLW5hdlwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkKFwiI25hdmlnYXRvcnNcIikuYXBwZW5kKCQoJCh0aGlzKS5hdHRyKFwicmVsXCIpKS5odG1sKCkpO1xuICAgICAgICBjb21wb25lbnRIYW5kbGVyLnVwZ3JhZGVEb20oKTtcblxuICAgIH0pO1xuICAgICQoJy5zZXR0aW5nLWZvcm0nKS5vbihcImNsaWNrXCIsIFwiLmRlbC1uYXZcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCQodGhpcykucGFyZW50KCkucGFyZW50KCkpO1xuICAgICAgICB2YXIgaXRlbSA9ICQodGhpcykucGFyZW50KCkucGFyZW50KClcbiAgICAgICAgYWxlcnRpZnkuY29uZmlybShcIkRlbGV0ZSB0aGlzIGl0ZW0/XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgJCgnLnNldHRpbmctZm9ybScpLm9uKFwiY2xpY2tcIiwgXCIuZGVsLWN1c3RvbVwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGl0ZW0gPSAkKHRoaXMpLnBhcmVudCgpLnBhcmVudCgpXG4gICAgICAgIGFsZXJ0aWZ5LmNvbmZpcm0oXCJEZWxldGUgdGhpcyBpdGVtP1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGl0ZW0ucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSlcbiIsIiQoZnVuY3Rpb24gKCkge1xuICAgIG5ldyBGb3JtVmFsaWRhdG9yKFwic2lnbnVwLWZvcm1cIiwgW1xuICAgICAgICB7XCJuYW1lXCI6IFwibmFtZVwiLCBcInJ1bGVzXCI6IFwicmVxdWlyZWRcIn0sXG4gICAgICAgIHtcIm5hbWVcIjogXCJlbWFpbFwiLCBcInJ1bGVzXCI6IFwicmVxdWlyZWRcIn0sXG4gICAgICAgIHtcIm5hbWVcIjogXCJwYXNzd29yZFwiLCBcInJ1bGVzXCI6IFwicmVxdWlyZWR8bWluX2xlbmd0aFs0XXxtYXhfbGVuZ3RoWzIwXVwifVxuICAgIF0sIGZ1bmN0aW9uIChlcnJvcnMsIGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgICAgYWxlcnRpZnkuZXJyb3IoXCJFcnJvcjogXCIgKyBlcnJvcnNbMF0ubWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJCgnI3NpZ251cC1mb3JtJykuYWpheFN1Ym1pdCh7XG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvYWRtaW4vXCI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgYWxlcnRpZnkuZXJyb3IoKFwiRXJyb3I6IFwiICsgSlNPTi5wYXJzZShqc29uLnJlc3BvbnNlVGV4dCkubXNnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pXG59KTtcbiIsImZ1bmN0aW9uIGVkaXRvckFjdGlvbihqc29uKSB7XG4gICAgdmFyIGNtID0gJCgnLkNvZGVNaXJyb3InKVswXS5Db2RlTWlycm9yO1xuICAgIHZhciBkb2MgPSBjbS5nZXREb2MoKTtcbiAgICBkb2MucmVwbGFjZVNlbGVjdGlvbnMoW1wiIVtdKC9cIiArIGpzb24uZmlsZS51cmwgKyBcIilcIl0pO1xufVxuXG5mdW5jdGlvbiBmaWxlc0FjdGlvbihqc29uKSB7XG4gICAgdmFyICRmaWxlTGluZSA9ICQoJzx0ciBpZD1cImZpbGUtJyArIGpzb24uZmlsZS5uYW1lICsgJ1wiPicgXG4gICAgICAgICsgJzx0ZCBjbGFzcz1cIm1kbC1kYXRhLXRhYmxlX19jZWxsLS1ub24tbnVtZXJpY1wiPicgKyBqc29uLmZpbGUudGltZSArICc8L3RkPidcbiAgICAgICAgLy8gKyAnPHRkIGNsYXNzPVwibWRsLWRhdGEtdGFibGVfX2NlbGwtLW5vbi1udW1lcmljXCI+JyArIGpzb24uZmlsZS5zaXplICsgJzwvdGQ+J1xuICAgICAgICArICc8dGQgY2xhc3M9XCJtZGwtZGF0YS10YWJsZV9fY2VsbC0tbm9uLW51bWVyaWNcIj4nICsganNvbi5maWxlLm5hbWUgKyAnPC90ZD4nXG4gICAgICAgICsgJzx0ZCBjbGFzcz1cIm1kbC1kYXRhLXRhYmxlX19jZWxsLS1ub24tbnVtZXJpY1wiPidcbiAgICAgICAgICArICc8aW1nIGNsYXNzPVwiYWRtaW4tdGh1bWJuYWlsXCIgc3JjPVwiLycgKyBqc29uLmZpbGUudXJsICsgJ1wiIGFsdD1cIlwiPidcbiAgICAgICAgKyAnPC90ZD4nXG4gICAgICAgICsgJzx0ZCBjbGFzcz1cIm1kbC1kYXRhLXRhYmxlX19jZWxsLS1ub24tbnVtZXJpY1wiPicgKyBqc29uLmZpbGUudHlwZSArICc8L3RkPidcbiAgICAgICAgK2AgPHRkIGNsYXNzPVwibWRsLWRhdGEtdGFibGVfX2NlbGwtLW5vbi1udW1lcmljXCI+XG4gICAgICAgICAgICA8c2VsZWN0IGNsYXNzPVwiZGlnLXNlbGVjdFwiIGlkPVwiJHtqc29uLmZpbGUuaWR9XCI+XG4gICAgICAgICAgICAgIDxvcHRpb24gJHtqc29uLmlzX3Nob3dfb25fZ2FsbGVyeSA/ICdzZWxlY3RlZCcgIDogJyd9IHZhbHVlID1cInRydWVcIj50cnVlPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24gJHtqc29uLmlzX3Nob3dfb25fZ2FsbGVyeSA/ICcnICA6ICdzZWxlY3RlZCd9IHZhbHVlID1cImZhbHNlXCI+ZmFsc2U8L29wdGlvbj5cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICA8L3RkPmBcblxuICAgICAgICArICc8dGQgY2xhc3M9XCJtZGwtZGF0YS10YWJsZV9fY2VsbC0tbm9uLW51bWVyaWNcIj4nXG4gICAgICAgICAgKyAnPGEgY2xhc3M9XCJidG4gYnRuLXNtYWxsIGJsdWVcIiBocmVmPVwiLycrIGpzb24uZmlsZS51cmwgKydcIiB0YXJnZXQ9XCJfYmxhbmtcIiB0aXRsZT1cIi8nICsganNvbi5maWxlLm5hbWUgKyAnXCI+VmlldzwvYT4mbmJzcDsnXG4gICAgICAgICAgKyAnPGEgY2xhc3M9XCJidG4gYnRuLXNtYWxsIHJlZCBkZWxldGUtZmlsZVwiIGhyZWY9XCIjXCIgbmFtZT1cIicgKyBqc29uLmZpbGUubmFtZSArICdcIiByZWw9XCInICsganNvbi5maWxlLnVybCArICdcIiB0aXRsZT1cIkRlbGV0ZVwiPkRlbGV0ZTwvYT4nXG4gICAgICAgICsgJzwvdGQ+PC90cj4nKTtcbiAgICAkKCd0Ym9keScpLnByZXBlbmQoJGZpbGVMaW5lKTtcbiAgICB3aW5kb3cubGlzdGVuRGlnU2VsZWN0RXZlbnQoKVxufVxuXG5mdW5jdGlvbiBpbml0VXBsb2FkKHApIHtcbiAgICAkKCcjYXR0YWNoLXNob3cnKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcjYXR0YWNoLXVwbG9hZCcpLnRyaWdnZXIoXCJjbGlja1wiKTtcbiAgICB9KTtcbiAgICAkKCcjYXR0YWNoLXVwbG9hZCcpLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYWxlcnRpZnkuY29uZmlybShcIlVwbG9hZCBub3c/XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGJhciA9ICQoJzxwIGNsYXNzPVwiZmlsZS1wcm9ncmVzcyBpbmxpbmUtYmxvY2tcIj4wJTwvcD4nKTtcbiAgICAgICAgICAgICQoJyNhdHRhY2gtZm9ybScpLmFqYXhTdWJtaXQoe1xuICAgICAgICAgICAgICAgIFwiYmVmb3JlU3VibWl0XCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJChwKS5iZWZvcmUoYmFyKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwidXBsb2FkUHJvZ3Jlc3NcIjogZnVuY3Rpb24gKGV2ZW50LCBwb3NpdGlvbiwgdG90YWwsIHBlcmNlbnRDb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGVyY2VudFZhbCA9IHBlcmNlbnRDb21wbGV0ZSArICclJztcbiAgICAgICAgICAgICAgICAgICAgYmFyLmNzcyhcIndpZHRoXCIsIHBlcmNlbnRWYWwpLmh0bWwocGVyY2VudFZhbCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcInN1Y2Nlc3NcIjogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnI2F0dGFjaC11cGxvYWQnKS52YWwoXCJcIik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uLnN0YXR1cyA9PT0gXCJlcnJvclwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXIuaHRtbChqc29uLm1zZykuYWRkQ2xhc3MoXCJlcnJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXIucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiRmlsZSBoYXMgYmVlbiB1cGxvYWRlZC5cIilcbiAgICAgICAgICAgICAgICAgICAgYmFyLmh0bWwoXCIvXCIgKyBqc29uLmZpbGUudXJsICsgXCImbmJzcDsmbmJzcDsmbmJzcDsoQFwiICsganNvbi5maWxlLm5hbWUgKyBcIilcIik7ICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgKCQoJy5Db2RlTWlycm9yJykubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzQWN0aW9uKGpzb24pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWRpdG9yQWN0aW9uKGpzb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCh0aGlzKS52YWwoXCJcIik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuIl19
