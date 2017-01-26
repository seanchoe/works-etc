var portfolioApp = angular.module('portfolioApp', ['ngRoute']);

portfolioApp.config(['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider) {
	$routeProvider.when('/:workId', {
        templateUrl : function(urlattr){
            return './works/' + urlattr.workId + '.html';
        },
        controller: 'ContentCtrl',
    })
}]);

portfolioApp.controller('NavigationCtrl', ['$scope', '$http', '$routeParams', '$location',
function($scope, $http, $routeParams, $location) {
	$http.get('./js/companies.json').success(function(companies) {
    	$scope.companies = companies;
    	$scope.homeId = companies[0].works[0].id;

    	if ($location.path() == '' || $location.path() == '/' || $location.path() == '#') {
			$location.path("/"+$scope.homeId);
		}
    });

    $scope.isActive = function(workId) {
		if ($routeParams.workId == workId) {
			return "active";
		}
		else {
			return "";
		}
	};
}]);

portfolioApp.controller('ContentCtrl', ['$scope', '$routeParams', '$http', 'contentService', 'galleryService',
function($scope, $routeParams, $http, contentService, galleryService) {
	$http.get('./js/companies.json').success(function(companies) {
    	for (i in companies) {
	    	var company = companies[i];
	    	for (j in company.works) {
		    	var work = company.works[j];
		    	if (work.id == $routeParams.workId) {
			    	contentService.setCurrentCompanyAndWork(company, work);
			    	break;
		    	}
	    	}
    	}
    });

    var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
    if (viewportWidth > 780) {
	    $(".main").scrollTop(0);
	}
	else {
		$(window).scrollTop(0);
		$("#sidebar").hide();
	}

    $scope.companyName = function() {
	    return contentService.getCurrentCompanyName();
    };
    $scope.workName = function() {
	    return contentService.getCurrentWorkName();
    };
    $scope.workYear = function() {
	    return contentService.getCurrentWorkYear();
    };
    $scope.showGallery = function(index) {
	    var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
	    if (viewportWidth > 780) {
		    var galleryWrapper = $("#image-gallery");
			galleryWrapper.fadeIn();
			galleryService.showFigureWithIndex(index);
		}
	};

    var figureArray = [];
    $('#content figure').each(function(index) {
	    var images = $(this).children('img');
	    images.each(function() {
		    $(this).css('width', $(this).data('width'));
	    });
	    $(this).data('index', index);
	    figureArray.push($(this).clone());
    })
    galleryService.setFigureList(figureArray);

}]);

portfolioApp.controller('GalleryCtrl', ['$scope', 'galleryService',
function($scope, galleryService) {
	$scope.closeGallery = function() {
		var galleryWrapper = $("#image-gallery");
		galleryWrapper.fadeOut(function() {
			$(this).css('display', 'none');
		});
		var galleyContent = $("#image-galley-content");
		galleyContent.html("");
	};

	$scope.arrowLeft = function() {
		var currentIndex = galleryService.getCurrentIndex();
		if (currentIndex > 0) {
			galleryService.showFigureWithIndex(currentIndex - 1);
			resizeGalleryImage();
		}
	};

	$scope.arrowRight = function() {
		var currentIndex = galleryService.getCurrentIndex();
		if (currentIndex < galleryService.getListCount() - 1) {
			galleryService.showFigureWithIndex(currentIndex + 1);
			resizeGalleryImage();
		}
	};
}]);

portfolioApp.factory('contentService', function() {
	var currentCompany;
	var currentWork;

	var setCurrentCompanyAndWork = function(company, work) {
		currentCompany = company;
		currentWork = work;
	};

	var getCurrentCompanyName = function() {
		if (currentCompany != null) {
			return currentCompany.name;
		}
		return "";
	};

	var getCurrentWorkName = function() {
		if (currentWork != null) {
			return currentWork.name;
		}
		return "";
	};

	var getCurrentWorkYear = function() {
		if (currentWork != null) {
			return currentWork.year;
		}
		return "";
	};

	return {
		setCurrentCompanyAndWork: setCurrentCompanyAndWork,
		getCurrentCompanyName: getCurrentCompanyName,
		getCurrentWorkName: getCurrentWorkName,
		getCurrentWorkYear: getCurrentWorkYear
	};
});

portfolioApp.factory('galleryService', function() {
	var figureList = [];
	var currentIndex = 0;

	var setFigureList = function(list) {
		figureList = list;
	}

	var showFigureWithIndex = function(index) {
		currentIndex = index;
		var currentFigure = figureList[index];

		var figure = figureList[index];
		var galleyContent = $("#image-galley-content");
		galleyContent.html(figure);

		var image = currentFigure.children('img');
		image.css('width', '');
		var ratio = image.height() / image.width();
		image.data('originalWidth', image.width());
		image.data('ratio', ratio);

		resizeGalleryImage();

		$('#arrow-left').show();
		$('#arrow-right').show();

		if (currentIndex == 0) {
			$('#arrow-left').hide();
		}

		if (currentIndex === figureList.length - 1) {
			$('#arrow-right').hide();
		}
	}

	var getCurrentIndex = function() {
		return currentIndex;
	}

	var getListCount = function() {
		return figureList.length;
	}

	return {
		setFigureList: setFigureList,
		showFigureWithIndex: showFigureWithIndex,
		getCurrentIndex: getCurrentIndex,
		getListCount: getListCount
	}
});

function resizeGalleryImage() {
	var image = $("#image-galley-content img");
	var ratio = image.data("ratio");
	var originalWidth = image.data('originalWidth');

	var viewportHeight = $(window).height() - 50;

	var arrowWidth = $("#arrow-left").width();
	var viewportWidth = $(window).width() - arrowWidth * 2 - 80;

	if (originalWidth > viewportWidth || originalWidth * ratio > viewportHeight) {
		var viewportRatio = viewportHeight / viewportWidth;

		if (viewportRatio > ratio) {
			image.width(viewportWidth);
			image.height(Math.floor(image.width() * ratio));
		}
		else {
			image.height(viewportHeight);
			image.width(Math.floor(image.height() / ratio));
		}
	}
}

$(window).resize(function() {
	resizeGalleryImage();

	var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
    if (viewportWidth > 780) {
	    $("#sidebar").show();
	}
});

$(document).ready(function() {
	$("#sidebar-button").click(function() {
		var sidebar = $("#sidebar");
		if (sidebar.is(":visible")) {
			sidebar.hide();
		}
		else {
			sidebar.show();
		}
	});
});
