const handlebars = require('handlebars')

module.exports = {

    pagination: function (totalPages, currentPage, options) {
        let result = '';
        currentPage = parseInt(currentPage);
        totalPages = parseInt(totalPages);
        if (currentPage > 1) {
            result += '<span> <a class="me-3 text-dark fw-bold" href="?page=' + (currentPage - 1) + '">Previous</a> </span>';
        }
        for (let i = 1; i <= totalPages; i++) {
            result += '<span class="product_pagination"><a href="?page=' + i + '">' + i + '</a> </span>';
        }
        if (currentPage < totalPages) {
            result += '<span> <a class="text-dark fw-bold" href="?page=' + (currentPage + 1) + '">Next</a> </span>';
        }
        return new handlebars.SafeString(result);
    }

}