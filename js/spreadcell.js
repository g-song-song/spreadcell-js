function SpreadCell(params) {
  var is_undef = function(a) {
    return typeof(a) == "undefined"
  }
  if (is_undef(window.jQuery)) throw "jQuery must be loaded."
  if (is_undef(params.id)) throw "ID of the Google Spreadsheet must be specified."
  if (typeof(params.callback) != "function") throw "Callback must be a function."
  var table = {contain_header: !!params.contain_header}
  $.ajax({
    url: ("https://spreadsheets.google.com/feeds/cells/"
        + params.id + "/" + (params.sheet || "od6")
        + "/public/basic?alt=json"),
    success: function(response) {
      if (is_undef(response.feed)) throw "Invalid response. Maybe API changed."
      var get_RC = function(entry) {
        var idx = entry.id.$t.lastIndexOf("/");
        if (idx == -1) throw "Malformed entry. Maybe API changed.";
        return entry.id.$t.substr(idx + 2).split("C").map(Number);
      }
      var data = response.feed.entry
      var len = data.length
      table.dim = get_RC(data[len - 1])
      var raw = [];
      for (var i = 0; i < table.dim[0]; i++) {
        raw[i] = new Array(table.dim[1])
      }
      for (var i = 0; i < len; i++) {
        var RC = get_RC(data[i]);
        raw[RC[0] - 1][RC[1] - 1] = data[i].content.$t;
      }
      table.name = response.feed.title.$t
      if (table.contain_header) table.header = raw.slice(0, table.contain_header)[0]
      table.body = raw.slice(table.contain_header)
      table.dim[0] -= table.contain_header
      delete table.contain_header
      params.callback(table)
    }
  })
  return table
}
