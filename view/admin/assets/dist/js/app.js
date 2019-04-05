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
    var name = me.attr("name");
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

$(function() {
  $(".dig-select").change(function(){
    console.log($(this))
    var selected=$(this).children('option:selected').val();
  })
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
            <select class="dig-select" name="{{.Name}}">
            <option value ="true">true</option>
            <option value ="false">false</option>
            </select>
        </td>`

        + '<td class="mdl-data-table__cell--non-numeric">'
          + '<a class="btn btn-small blue" href="/'+ json.file.url +'" target="_blank" title="/' + json.file.name + '">View</a>&nbsp;'
          + '<a class="btn btn-small red delete-file" href="#" name="' + json.file.name + '" rel="' + json.file.url + '" title="Delete">Delete</a>'
        + '</td></tr>');
    $('tbody').prepend($fileLine);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbW1lbnRzLmpzIiwiZWRpdG9yLmpzIiwiZmlsZXMuanMiLCJsb2dpbi5qcyIsInBhc3N3b3JkLmpzIiwicG9zdHMuanMiLCJwcm9maWxlLmpzIiwic2V0dGluZ3MuanMiLCJzaWdudXAuanMiLCJ1cGxvYWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSBLdXBsZXRza3kgU2VyZ2V5IG9uIDE3LjEwLjE0LlxuICpcbiAqIE1hdGVyaWFsIFNpZGViYXIgKFByb2ZpbGUgbWVudSlcbiAqIFRlc3RlZCBvbiBXaW44LjEgd2l0aCBicm93c2VyczogQ2hyb21lIDM3LCBGaXJlZm94IDMyLCBPcGVyYSAyNSwgSUUgMTEsIFNhZmFyaSA1LjEuN1xuICogWW91IGNhbiB1c2UgdGhpcyBzaWRlYmFyIGluIEJvb3RzdHJhcCAodjMpIHByb2plY3RzLiBIVE1MLW1hcmt1cCBsaWtlIE5hdmJhciBib290c3RyYXAgY29tcG9uZW50IHdpbGwgbWFrZSB5b3VyIHdvcmsgZWFzaWVyLlxuICogRHJvcGRvd24gbWVudSBhbmQgc2lkZWJhciB0b2dnbGUgYnV0dG9uIHdvcmtzIHdpdGggSlF1ZXJ5IGFuZCBCb290c3RyYXAubWluLmpzXG4gKi9cblxuLy8gU2lkZWJhciB0b2dnbGVcbi8vXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICB2YXIgb3ZlcmxheSA9ICQoJy5zaWRlYmFyLW92ZXJsYXknKTtcblxuICAgICQoJy5zaWRlYmFyLXRvZ2dsZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2lkZWJhciA9ICQoJyNzaWRlYmFyJyk7XG4gICAgICAgIHNpZGViYXIudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgaWYgKChzaWRlYmFyLmhhc0NsYXNzKCdzaWRlYmFyLWZpeGVkLWxlZnQnKSB8fCBzaWRlYmFyLmhhc0NsYXNzKCdzaWRlYmFyLWZpeGVkLXJpZ2h0JykpICYmIHNpZGViYXIuaGFzQ2xhc3MoJ29wZW4nKSkge1xuICAgICAgICAgICAgb3ZlcmxheS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdmVybGF5LnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgb3ZlcmxheS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJyNzaWRlYmFyJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICB9KTtcblxufSk7XG5cbi8vIFNpZGViYXIgY29uc3RydWN0b3Jcbi8vXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblxuICAgIHZhciBzaWRlYmFyID0gJCgnI3NpZGViYXInKTtcbiAgICB2YXIgc2lkZWJhckhlYWRlciA9ICQoJyNzaWRlYmFyIC5zaWRlYmFyLWhlYWRlcicpO1xuICAgIHZhciBzaWRlYmFySW1nID0gc2lkZWJhckhlYWRlci5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKTtcbiAgICB2YXIgdG9nZ2xlQnV0dG9ucyA9ICQoJy5zaWRlYmFyLXRvZ2dsZScpO1xuXG4gICAgLy8gSGlkZSB0b2dnbGUgYnV0dG9ucyBvbiBkZWZhdWx0IHBvc2l0aW9uXG4gICAgdG9nZ2xlQnV0dG9ucy5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgICQoJ2JvZHknKS5jc3MoJ2Rpc3BsYXknLCAndGFibGUnKTtcblxuXG4gICAgLy8gU2lkZWJhciBwb3NpdGlvblxuICAgICQoJyNzaWRlYmFyLXBvc2l0aW9uJykuY2hhbmdlKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSAkKCB0aGlzICkudmFsKCk7XG4gICAgICAgIHNpZGViYXIucmVtb3ZlQ2xhc3MoJ3NpZGViYXItZml4ZWQtbGVmdCBzaWRlYmFyLWZpeGVkLXJpZ2h0IHNpZGViYXItc3RhY2tlZCcpLmFkZENsYXNzKHZhbHVlKS5hZGRDbGFzcygnb3BlbicpO1xuICAgICAgICBpZiAodmFsdWUgPT0gJ3NpZGViYXItZml4ZWQtbGVmdCcgfHwgdmFsdWUgPT0gJ3NpZGViYXItZml4ZWQtcmlnaHQnKSB7XG4gICAgICAgICAgICAkKCcuc2lkZWJhci1vdmVybGF5JykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNob3cgdG9nZ2xlIGJ1dHRvbnNcbiAgICAgICAgaWYgKHZhbHVlICE9ICcnKSB7XG4gICAgICAgICAgICB0b2dnbGVCdXR0b25zLmNzcygnZGlzcGxheScsICdpbml0aWFsJyk7XG4gICAgICAgICAgICAkKCdib2R5JykuY3NzKCdkaXNwbGF5JywgJ2luaXRpYWwnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEhpZGUgdG9nZ2xlIGJ1dHRvbnNcbiAgICAgICAgICAgIHRvZ2dsZUJ1dHRvbnMuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgICAgICAgICQoJ2JvZHknKS5jc3MoJ2Rpc3BsYXknLCAndGFibGUnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gU2lkZWJhciB0aGVtZVxuICAgICQoJyNzaWRlYmFyLXRoZW1lJykuY2hhbmdlKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSAkKCB0aGlzICkudmFsKCk7XG4gICAgICAgIHNpZGViYXIucmVtb3ZlQ2xhc3MoJ3NpZGViYXItZGVmYXVsdCBzaWRlYmFyLWludmVyc2Ugc2lkZWJhci1jb2xvcmVkIHNpZGViYXItY29sb3JlZC1pbnZlcnNlJykuYWRkQ2xhc3ModmFsdWUpXG4gICAgfSk7XG5cbiAgICAvLyBIZWFkZXIgY292ZXJcbiAgICAkKCcjc2lkZWJhci1oZWFkZXInKS5jaGFuZ2UoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9ICQodGhpcykudmFsKCk7XG5cbiAgICAgICAgJCgnLnNpZGViYXItaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1jb3ZlcicpLmFkZENsYXNzKHZhbHVlKTtcblxuICAgICAgICBpZiAodmFsdWUgPT0gJ2hlYWRlci1jb3ZlcicpIHtcbiAgICAgICAgICAgIHNpZGViYXJIZWFkZXIuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgc2lkZWJhckltZylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNpZGViYXJIZWFkZXIuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJycpXG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuXG4vKipcbiAqIENyZWF0ZWQgYnkgS3VwbGV0c2t5IFNlcmdleSBvbiAwOC4wOS4xNC5cbiAqXG4gKiBBZGQgSlF1ZXJ5IGFuaW1hdGlvbiB0byBib290c3RyYXAgZHJvcGRvd24gZWxlbWVudHMuXG4gKi9cblxuKGZ1bmN0aW9uKCQpIHtcbiAgICB2YXIgZHJvcGRvd24gPSAkKCcuZHJvcGRvd24nKTtcblxuICAgIC8vIEFkZCBzbGlkZWRvd24gYW5pbWF0aW9uIHRvIGRyb3Bkb3duXG4gICAgZHJvcGRvd24ub24oJ3Nob3cuYnMuZHJvcGRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgJCh0aGlzKS5maW5kKCcuZHJvcGRvd24tbWVudScpLmZpcnN0KCkuc3RvcCh0cnVlLCB0cnVlKS5zbGlkZURvd24oKTtcbiAgICB9KTtcblxuICAgIC8vIEFkZCBzbGlkZXVwIGFuaW1hdGlvbiB0byBkcm9wZG93blxuICAgIGRyb3Bkb3duLm9uKCdoaWRlLmJzLmRyb3Bkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICQodGhpcykuZmluZCgnLmRyb3Bkb3duLW1lbnUnKS5maXJzdCgpLnN0b3AodHJ1ZSwgdHJ1ZSkuc2xpZGVVcCgpO1xuICAgIH0pO1xufSkoalF1ZXJ5KTtcblxuXG5cbihmdW5jdGlvbihyZW1vdmVDbGFzcykge1xuXG5cdGpRdWVyeS5mbi5yZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHRpZiAoIHZhbHVlICYmIHR5cGVvZiB2YWx1ZS50ZXN0ID09PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHRmb3IgKCB2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcblx0XHRcdFx0dmFyIGVsZW0gPSB0aGlzW2ldO1xuXHRcdFx0XHRpZiAoIGVsZW0ubm9kZVR5cGUgPT09IDEgJiYgZWxlbS5jbGFzc05hbWUgKSB7XG5cdFx0XHRcdFx0dmFyIGNsYXNzTmFtZXMgPSBlbGVtLmNsYXNzTmFtZS5zcGxpdCggL1xccysvICk7XG5cblx0XHRcdFx0XHRmb3IgKCB2YXIgbiA9IGNsYXNzTmFtZXMubGVuZ3RoOyBuLS07ICkge1xuXHRcdFx0XHRcdFx0aWYgKCB2YWx1ZS50ZXN0KGNsYXNzTmFtZXNbbl0pICkge1xuXHRcdFx0XHRcdFx0XHRjbGFzc05hbWVzLnNwbGljZShuLCAxKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxlbS5jbGFzc05hbWUgPSBqUXVlcnkudHJpbSggY2xhc3NOYW1lcy5qb2luKFwiIFwiKSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlbW92ZUNsYXNzLmNhbGwodGhpcywgdmFsdWUpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG59KShqUXVlcnkuZm4ucmVtb3ZlQ2xhc3MpO1xuIiwiJChmdW5jdGlvbiAoKSB7XG4gICAgJCgnLmNvbW1lbnQtZGVsZXRlJykub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjb21tZW50ID0gJCh0aGlzKTtcbiAgICAgICAgYWxlcnRpZnkuY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyBwb3N0P1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBpZCA9IGNvbW1lbnQuYXR0cihcInJlbFwiKTtcbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJkZWxldGVcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FkbWluL2NvbW1lbnRzLz9pZD1cIiArIGlkLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJDb21tZW50IGRlbHRlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnI2NvbW1lbnQtJyArIGlkKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgICAgICBhbGVydGlmeS5lcnJvcigoXCJFcnJvcjogXCIgKyBKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgJCgnLmNvbW1lbnQtYXBwcm92ZScpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY29tbWVudCA9ICQodGhpcyk7XG4gICAgICAgIHZhciBpZCA9ICQodGhpcykuYXR0cihcInJlbFwiKTtcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHR5cGU6IFwicHV0XCIsXG4gICAgICAgICAgICB1cmw6IFwiL2FkbWluL2NvbW1lbnRzLz9pZD1cIiArIGlkLFxuICAgICAgICAgICAgXCJzdWNjZXNzXCI6ZnVuY3Rpb24oanNvbil7XG4gICAgICAgICAgICAgICAgaWYoanNvbi5zdGF0dXMgPT09IFwic3VjY2Vzc1wiKXtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIkNvbW1lbnQgYXBwcm92ZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQucmVtb3ZlQ2xhc3MoXCJjb21tZW50LWFwcHJvdmVcIikucmVtb3ZlQ2xhc3MoXCJtZGwtY29sb3ItdGV4dC0tZ3JlZW5cIikuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQudW5iaW5kKCk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0aWZ5LmVycm9yKChcIkVycm9yOiBcIiArIEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbiAgICAkKCcuY29tbWVudC1yZXBseScpLm9uKFwiY2xpY2tcIixmdW5jdGlvbigpe1xuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoXCJyZWxcIik7XG4gICAgICAgICQoJyNjb21tZW50LScraWQpLmFmdGVyKCQoJyNjb21tZW50LWJsb2NrJykuZGV0YWNoKCkuc2hvdygpKTtcbiAgICAgICAgJCgnI2NvbW1lbnQtcGFyZW50JykudmFsKGlkKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuICAgICQoJyNjb21tZW50LWZvcm0nKS5hamF4Rm9ybSh7XG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiU3VjY2VzZnVsbHkgcmVwbGllZFwiKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvYWRtaW4vY29tbWVudHMvXCI7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgYWxlcnRpZnkuZXJyb3IoKFwiRXJyb3I6IFwiICsgSlNPTi5wYXJzZShqc29uLnJlc3BvbnNlVGV4dCkubXNnKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAkKCcjY29tbWVudC1jbG9zZScpLm9uKFwiY2xpY2tcIixmdW5jdGlvbigpe1xuICAgICAgICAkKCcjY29tbWVudC1ibG9jaycpLmhpZGUoKTtcbiAgICAgICAgJCgnI2NvbW1lbnQtcGFyZW50JykudmFsKDApO1xuICAgICAgICAkKCcjY29tbWVudC1jb250ZW50JykudmFsKFwiXCIpO1xuICAgIH0pO1xufSk7XG4iLCIkKGZ1bmN0aW9uICgpIHtcbiAgbmV3IEZvcm1WYWxpZGF0b3IoXCJwb3N0LWZvcm1cIiwgW1xuICAgICAge1wibmFtZVwiOiBcInNsdWdcIiwgXCJydWxlc1wiOiBcImFscGhhX2Rhc2hcIn1cbiAgXSwgZnVuY3Rpb24gKGVycm9ycywgZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCcuaW52YWxpZCcpLmhpZGUoKTtcbiAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgJChcIiNcIiArIGVycm9yc1swXS5pZCArIFwiLWludmFsaWRcIikucmVtb3ZlQ2xhc3MoXCJoaWRlXCIpLnNob3coKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgJCgnI3Bvc3QtZm9ybScpLmFqYXhTdWJtaXQoe1xuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICBpZiAoanNvbi5zdGF0dXMgPT09IFwic3VjY2Vzc1wiKSB7XG4gICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJDb250ZW50IHNhdmVkXCIsICdzdWNjZXNzJyk7XG4gICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSh7fSwgXCJcIiwgXCIvYWRtaW4vZWRpdG9yL1wiICsganNvbi5jb250ZW50LklkICsgXCIvXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWxlcnRpZnkuZXJyb3IoanNvbi5tc2cpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZXJyb3I6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgIGFsZXJ0aWZ5LmVycm9yKChcIkVycm9yOiBcIiArIEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgIH1cbiAgICB9KTtcbiAgfSk7XG4gIGluaXRVcGxvYWQoXCIjcG9zdC1pbmZvcm1hdGlvblwiKTtcbn0pO1xuIiwiJChmdW5jdGlvbigpIHtcbiAgJChcIiNmaWxlc190YWJsZVwiKS5vbihcImNsaWNrXCIsIFwiLmRlbGV0ZS1maWxlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgbWUgPSAkKHRoaXMpO1xuICAgIHZhciBuYW1lID0gbWUuYXR0cihcIm5hbWVcIik7XG4gICAgdmFyIGlkID0gbWUuYXR0cihcImlkXCIpO1xuXG4gICAgYWxlcnRpZnkuY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyBmaWxlP1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICQuYWpheCh7XG4gICAgICAgIHR5cGU6IFwiZGVsZXRlXCIsXG4gICAgICAgIHVybDogXCIvYWRtaW4vZmlsZXMvP2lkPVwiICsgaWQsXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGpzb24pIHtcbiAgICAgICAgICBpZiAoanNvbi5zdGF0dXMgPT09IFwic3VjY2Vzc1wiKSB7XG4gICAgICAgICAgICBtZS5wYXJlbnQoKVxuICAgICAgICAgICAgICAucGFyZW50KClcbiAgICAgICAgICAgICAgLnJlbW92ZSgpO1xuICAgICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIkZpbGUgZGVsZXRlZFwiKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWxlcnQoanNvbi5tc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbiQoZnVuY3Rpb24oKSB7XG4gICQoXCIuZGlnLXNlbGVjdFwiKS5jaGFuZ2UoZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLmxvZygkKHRoaXMpKVxuICAgIHZhciBzZWxlY3RlZD0kKHRoaXMpLmNoaWxkcmVuKCdvcHRpb246c2VsZWN0ZWQnKS52YWwoKTtcbiAgfSlcbn0pO1xuIiwiJChmdW5jdGlvbiAoKSB7XG4gIG5ldyBGb3JtVmFsaWRhdG9yKFwibG9naW4tZm9ybVwiLCBbXG4gICAgICB7XCJuYW1lXCI6IFwicGFzc3dvcmRcIiwgXCJydWxlc1wiOiBcInJlcXVpcmVkfG1pbl9sZW5ndGhbNF18bWF4X2xlbmd0aFsyMF1cIn1cbiAgXSwgZnVuY3Rpb24gKGVycm9ycywgZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCcuaW52YWxpZCcpLmhpZGUoKTtcbiAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgJChcIiNcIiArIGVycm9yc1swXS5pZCArIFwiLWludmFsaWRcIikucmVtb3ZlQ2xhc3MoXCJoaWRlXCIpLnNob3coKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkKCcjbG9naW4tZm9ybScpLmFqYXhTdWJtaXQoe1xuICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgaWYgKGpzb24uc3RhdHVzID09PSBcImVycm9yXCIpIHtcbiAgICAgICAgICBhbGVydGlmeS5lcnJvcihcIkluY29ycmVjdCB1c2VybmFtZSAmIHBhc3N3b3JkIGNvbWJpbmF0aW9uLlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2FkbWluL1wiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG59KTtcbiIsIiQoZnVuY3Rpb24oKXtcbiAgbmV3IEZvcm1WYWxpZGF0b3IoXCJwYXNzd29yZC1mb3JtXCIsW1xuICAgICAge1wibmFtZVwiOlwib2xkXCIsXCJydWxlc1wiOlwibWluX2xlbmd0aFsyXXxtYXhfbGVuZ3RoWzIwXVwifSxcbiAgICAgIHtcIm5hbWVcIjpcIm5ld1wiLFwicnVsZXNcIjpcIm1pbl9sZW5ndGhbMl18bWF4X2xlbmd0aFsyMF1cIn0sXG4gICAgICB7XCJuYW1lXCI6XCJjb25maXJtXCIsXCJydWxlc1wiOlwicmVxdWlyZWR8bWF0Y2hlc1tuZXddXCJ9XG4gIF0sZnVuY3Rpb24oZXJyb3JzLGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCcuaW52YWxpZCcpLmhpZGUoKTtcbiAgICBpZihlcnJvcnMubGVuZ3RoKXtcbiAgICAgICQoXCIjXCIrZXJyb3JzWzBdLmlkK1wiLWludmFsaWRcIikucmVtb3ZlQ2xhc3MoXCJoaWRlXCIpLnNob3coKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgJCgnI3Bhc3N3b3JkJykuYWpheFN1Ym1pdCh7XG4gICAgICBcInN1Y2Nlc3NcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJQYXNzd29yZCBjaGFuZ2VkXCIpO1xuICAgICAgfSxcbiAgICAgIFwiZXJyb3JcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGFsZXJ0aWZ5LmVycm9yKChcIkVycm9yOiBcIiArIEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KVxufSk7XG4iLCIkKFwiLmRlbGV0ZS1wb3N0XCIpLm9uKFwiY2xpY2tcIixmdW5jdGlvbihlKXtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoXCJyZWxcIik7XG4gIGFsZXJ0aWZ5LmNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgcG9zdD9cIiwgZnVuY3Rpb24oKSB7XG4gICAgJC5hamF4KHtcbiAgICAgIFwidXJsXCI6XCIvYWRtaW4vZWRpdG9yL1wiK2lkK1wiL1wiLFxuICAgICAgXCJ0eXBlXCI6XCJkZWxldGVcIixcbiAgICAgIFwic3VjY2Vzc1wiOmZ1bmN0aW9uKGpzb24pe1xuICAgICAgICBpZihqc29uLnN0YXR1cyA9PT0gXCJzdWNjZXNzXCIpe1xuICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJQb3N0IGRlbGV0ZWRcIik7XG4gICAgICAgICAgJCgnI2RpbmdvLXBvc3QtJyArIGlkKS5yZW1vdmUoKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYWxlcnRpZnkuZXJyb3IoKEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbiIsIiQoZnVuY3Rpb24oKXtcbiAgICBuZXcgRm9ybVZhbGlkYXRvcihcInByb2ZpbGUtZm9ybVwiLFtcbiAgICAgICAge1wibmFtZVwiOlwic2x1Z1wiLFwicnVsZXNcIjpcImFscGhhX251bWVyaWN8bWluX2xlbmd0aFsxXXxtYXhfbGVuZ3RoWzIwXVwifSxcbiAgICAgICAge1wibmFtZVwiOlwiZW1haWxcIixcInJ1bGVzXCI6XCJ2YWxpZF9lbWFpbFwifSxcbiAgICAgICAge1wibmFtZVwiOlwidXJsXCIsXCJydWxlc1wiOlwidmFsaWRfdXJsXCJ9XG4gICAgXSxmdW5jdGlvbihlcnJvcnMsZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQoJy5pbnZhbGlkJykuaGlkZSgpO1xuICAgICAgICBpZihlcnJvcnMubGVuZ3RoKXtcbiAgICAgICAgICAgICQoXCIjXCIrZXJyb3JzWzBdLmlkK1wiLWludmFsaWRcIikucmVtb3ZlQ2xhc3MoXCJoaWRlXCIpLnNob3coKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkKCcjcHJvZmlsZScpLmFqYXhTdWJtaXQoZnVuY3Rpb24oanNvbil7XG4gICAgICAgICAgICBpZihqc29uLnN0YXR1cyA9PT0gXCJlcnJvclwiKXtcbiAgICAgICAgICAgICAgICBhbGVydChqc29uLm1zZyk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBhbGVydGlmeS5zdWNjZXNzKFwiUHJvZmlsZSBzYXZlZFwiKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9KVxufSk7XG4iLCIkKGZ1bmN0aW9uICgpIHtcbiAgICAkKCcuc2V0dGluZy1mb3JtJykuYWpheEZvcm0oe1xuICAgICAgICAnc3VjY2Vzcyc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYWxlcnRpZnkuc3VjY2VzcyhcIlNhdmVkXCIpO1xuICAgICAgICB9LFxuICAgICAgICAnZXJyb3InOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFsZXJ0aWZ5LmVycm9yKChcIkVycm9yOiBcIiArIEpTT04ucGFyc2UoanNvbi5yZXNwb25zZVRleHQpLm1zZykpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgJChcIiNhZGQtY3VzdG9tXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQoXCIjY3VzdG9tLXNldHRpbmdzXCIpLmFwcGVuZCgkKCQodGhpcykuYXR0cihcInJlbFwiKSkuaHRtbCgpKTtcbiAgICAgICAgY29tcG9uZW50SGFuZGxlci51cGdyYWRlRG9tKCk7XG4gICAgfSk7XG4gICAgJChcIiNhZGQtbmF2XCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQoXCIjbmF2aWdhdG9yc1wiKS5hcHBlbmQoJCgkKHRoaXMpLmF0dHIoXCJyZWxcIikpLmh0bWwoKSk7XG4gICAgICAgIGNvbXBvbmVudEhhbmRsZXIudXBncmFkZURvbSgpO1xuXG4gICAgfSk7XG4gICAgJCgnLnNldHRpbmctZm9ybScpLm9uKFwiY2xpY2tcIiwgXCIuZGVsLW5hdlwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc29sZS5sb2coJCh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKSk7XG4gICAgICAgIHZhciBpdGVtID0gJCh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKVxuICAgICAgICBhbGVydGlmeS5jb25maXJtKFwiRGVsZXRlIHRoaXMgaXRlbT9cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpdGVtLnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICAkKCcuc2V0dGluZy1mb3JtJykub24oXCJjbGlja1wiLCBcIi5kZWwtY3VzdG9tXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgaXRlbSA9ICQodGhpcykucGFyZW50KCkucGFyZW50KClcbiAgICAgICAgYWxlcnRpZnkuY29uZmlybShcIkRlbGV0ZSB0aGlzIGl0ZW0/XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KVxuIiwiJChmdW5jdGlvbiAoKSB7XG4gICAgbmV3IEZvcm1WYWxpZGF0b3IoXCJzaWdudXAtZm9ybVwiLCBbXG4gICAgICAgIHtcIm5hbWVcIjogXCJuYW1lXCIsIFwicnVsZXNcIjogXCJyZXF1aXJlZFwifSxcbiAgICAgICAge1wibmFtZVwiOiBcImVtYWlsXCIsIFwicnVsZXNcIjogXCJyZXF1aXJlZFwifSxcbiAgICAgICAge1wibmFtZVwiOiBcInBhc3N3b3JkXCIsIFwicnVsZXNcIjogXCJyZXF1aXJlZHxtaW5fbGVuZ3RoWzRdfG1heF9sZW5ndGhbMjBdXCJ9XG4gICAgXSwgZnVuY3Rpb24gKGVycm9ycywgZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBhbGVydGlmeS5lcnJvcihcIkVycm9yOiBcIiArIGVycm9yc1swXS5tZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkKCcjc2lnbnVwLWZvcm0nKS5hamF4U3VibWl0KHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9hZG1pbi9cIjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICBhbGVydGlmeS5lcnJvcigoXCJFcnJvcjogXCIgKyBKU09OLnBhcnNlKGpzb24ucmVzcG9uc2VUZXh0KS5tc2cpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSlcbn0pO1xuIiwiZnVuY3Rpb24gZWRpdG9yQWN0aW9uKGpzb24pIHtcbiAgICB2YXIgY20gPSAkKCcuQ29kZU1pcnJvcicpWzBdLkNvZGVNaXJyb3I7XG4gICAgdmFyIGRvYyA9IGNtLmdldERvYygpO1xuICAgIGRvYy5yZXBsYWNlU2VsZWN0aW9ucyhbXCIhW10oL1wiICsganNvbi5maWxlLnVybCArIFwiKVwiXSk7XG59XG5cbmZ1bmN0aW9uIGZpbGVzQWN0aW9uKGpzb24pIHtcbiAgICB2YXIgJGZpbGVMaW5lID0gJCgnPHRyIGlkPVwiZmlsZS0nICsganNvbi5maWxlLm5hbWUgKyAnXCI+JyBcbiAgICAgICAgKyAnPHRkIGNsYXNzPVwibWRsLWRhdGEtdGFibGVfX2NlbGwtLW5vbi1udW1lcmljXCI+JyArIGpzb24uZmlsZS50aW1lICsgJzwvdGQ+J1xuICAgICAgICAvLyArICc8dGQgY2xhc3M9XCJtZGwtZGF0YS10YWJsZV9fY2VsbC0tbm9uLW51bWVyaWNcIj4nICsganNvbi5maWxlLnNpemUgKyAnPC90ZD4nXG4gICAgICAgICsgJzx0ZCBjbGFzcz1cIm1kbC1kYXRhLXRhYmxlX19jZWxsLS1ub24tbnVtZXJpY1wiPicgKyBqc29uLmZpbGUubmFtZSArICc8L3RkPidcbiAgICAgICAgKyAnPHRkIGNsYXNzPVwibWRsLWRhdGEtdGFibGVfX2NlbGwtLW5vbi1udW1lcmljXCI+J1xuICAgICAgICAgICsgJzxpbWcgY2xhc3M9XCJhZG1pbi10aHVtYm5haWxcIiBzcmM9XCIvJyArIGpzb24uZmlsZS51cmwgKyAnXCIgYWx0PVwiXCI+J1xuICAgICAgICArICc8L3RkPidcbiAgICAgICAgKyAnPHRkIGNsYXNzPVwibWRsLWRhdGEtdGFibGVfX2NlbGwtLW5vbi1udW1lcmljXCI+JyArIGpzb24uZmlsZS50eXBlICsgJzwvdGQ+J1xuICAgICAgICArYCA8dGQgY2xhc3M9XCJtZGwtZGF0YS10YWJsZV9fY2VsbC0tbm9uLW51bWVyaWNcIj5cbiAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJkaWctc2VsZWN0XCIgbmFtZT1cInt7Lk5hbWV9fVwiPlxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZSA9XCJ0cnVlXCI+dHJ1ZTwvb3B0aW9uPlxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZSA9XCJmYWxzZVwiPmZhbHNlPC9vcHRpb24+XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgPC90ZD5gXG5cbiAgICAgICAgKyAnPHRkIGNsYXNzPVwibWRsLWRhdGEtdGFibGVfX2NlbGwtLW5vbi1udW1lcmljXCI+J1xuICAgICAgICAgICsgJzxhIGNsYXNzPVwiYnRuIGJ0bi1zbWFsbCBibHVlXCIgaHJlZj1cIi8nKyBqc29uLmZpbGUudXJsICsnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgdGl0bGU9XCIvJyArIGpzb24uZmlsZS5uYW1lICsgJ1wiPlZpZXc8L2E+Jm5ic3A7J1xuICAgICAgICAgICsgJzxhIGNsYXNzPVwiYnRuIGJ0bi1zbWFsbCByZWQgZGVsZXRlLWZpbGVcIiBocmVmPVwiI1wiIG5hbWU9XCInICsganNvbi5maWxlLm5hbWUgKyAnXCIgcmVsPVwiJyArIGpzb24uZmlsZS51cmwgKyAnXCIgdGl0bGU9XCJEZWxldGVcIj5EZWxldGU8L2E+J1xuICAgICAgICArICc8L3RkPjwvdHI+Jyk7XG4gICAgJCgndGJvZHknKS5wcmVwZW5kKCRmaWxlTGluZSk7XG59XG5cbmZ1bmN0aW9uIGluaXRVcGxvYWQocCkge1xuICAgICQoJyNhdHRhY2gtc2hvdycpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICQoJyNhdHRhY2gtdXBsb2FkJykudHJpZ2dlcihcImNsaWNrXCIpO1xuICAgIH0pO1xuICAgICQoJyNhdHRhY2gtdXBsb2FkJykub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBhbGVydGlmeS5jb25maXJtKFwiVXBsb2FkIG5vdz9cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgYmFyID0gJCgnPHAgY2xhc3M9XCJmaWxlLXByb2dyZXNzIGlubGluZS1ibG9ja1wiPjAlPC9wPicpO1xuICAgICAgICAgICAgJCgnI2F0dGFjaC1mb3JtJykuYWpheFN1Ym1pdCh7XG4gICAgICAgICAgICAgICAgXCJiZWZvcmVTdWJtaXRcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAkKHApLmJlZm9yZShiYXIpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJ1cGxvYWRQcm9ncmVzc1wiOiBmdW5jdGlvbiAoZXZlbnQsIHBvc2l0aW9uLCB0b3RhbCwgcGVyY2VudENvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwZXJjZW50VmFsID0gcGVyY2VudENvbXBsZXRlICsgJyUnO1xuICAgICAgICAgICAgICAgICAgICBiYXIuY3NzKFwid2lkdGhcIiwgcGVyY2VudFZhbCkuaHRtbChwZXJjZW50VmFsKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwic3VjY2Vzc1wiOiBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgICAgICAkKCcjYXR0YWNoLXVwbG9hZCcpLnZhbChcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb24uc3RhdHVzID09PSBcImVycm9yXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhci5odG1sKGpzb24ubXNnKS5hZGRDbGFzcyhcImVyclwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhci5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDUwMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0aWZ5LnN1Y2Nlc3MoXCJGaWxlIGhhcyBiZWVuIHVwbG9hZGVkLlwiKVxuICAgICAgICAgICAgICAgICAgICBiYXIuaHRtbChcIi9cIiArIGpzb24uZmlsZS51cmwgKyBcIiZuYnNwOyZuYnNwOyZuYnNwOyhAXCIgKyBqc29uLmZpbGUubmFtZSArIFwiKVwiKTsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiAoJCgnLkNvZGVNaXJyb3InKS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXNBY3Rpb24oanNvbik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0b3JBY3Rpb24oanNvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKHRoaXMpLnZhbChcIlwiKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG4iXX0=
