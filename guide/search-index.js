mdocSearchData = [["@@index@@webtau","","Index","WebTau","WebTau (Web Test automation) - concise and expressive way to create REST API and Web UI tests. package scenarios.rest import static com.twosigma.webtau.WebTauGroovyDsl.* scenario(\"simple get\") { http.get(\"/weather\") { temperature.shouldBe \u003c 100 } } package scenarios.ui import static com.twosigma.webtau.WebTauGroovyDsl.* import static pages.Pages.* scenario(\"search by specific query\") { search.submit(\"search this\") search.numberOfResults.should \u003d\u003d 2 }"],["REST@@getting-started@@bare-minimum","REST","Getting Started","Bare Minimum","package scenarios.rest import static com.twosigma.webtau.WebTauGroovyDsl.* scenario(\"simple get\") { http.get(\"/weather\") { temperature.shouldBe \u003c 100 } } To run test, navigate to examples dir and webtau scenarios/rest/simpleGet.groovy --url\u003dhttps://my-server"],["REST@@getting-started@@config-file","REST","Getting Started","Config File","Url parameter can be moved to a webtau.cfg file. url \u003d \"http://localhost:8180\" configuration/environments Specify multiple environments to streamline test execution."],["REST@@CRUD@@example","REST","CRUD","Example","We have an app that exposes create, read, update, and delete operations for customer records. Records are being served under /customers .Here is an example of a CRUD operations test. package scenarios.rest.springboot import static com.twosigma.webtau.WebTauGroovyDsl.* scenario(\"CRUD operations for customer\") { def customerPayload \u003d [firstName: \"FN\", lastName: \"LN\"] int id \u003d http.post(\"/customers\", customerPayload) { return id // return id value from response body } http.get(\"/customers/${id}\") { body.should \u003d\u003d customerPayload // only specified properties will be asserted against } def changedLastName \u003d \"NLN\" http.put(\"/customers/${id}\", [*:customerPayload, lastName: changedLastName]) { lastName.should \u003d\u003d changedLastName // specifying body is optional } http.get(\"/customers/${id}\") { lastName.should \u003d\u003d changedLastName } http.delete(\"/customers/${id}\") { statusCode.should \u003d\u003d 204 } http.get(\"/customers/${id}\") { statusCode.should \u003d\u003d 404 } }"],["REST@@CRUD@@implicit-statuscode-check","REST","CRUD","Implicit statusCode Check","If you don\u0027t have an explicit statusCode validation it will be automatically validated based on the rules below Method Expected Code [{text\u003dGET, type\u003dSimpleText}] [{text\u003d200, type\u003dSimpleText}] [{text\u003dPOST, type\u003dSimpleText}] [{text\u003d201, type\u003dSimpleText}] [{text\u003dPUT, type\u003dSimpleText}] [{text\u003d200, type\u003dSimpleText}] [{text\u003dPUT (no content), type\u003dSimpleText}] [{text\u003d204, type\u003dSimpleText}] [{text\u003dDELETE, type\u003dSimpleText}] [{text\u003d200, type\u003dSimpleText}] [{text\u003dDELETE (no content), type\u003dSimpleText}] [{text\u003d204, type\u003dSimpleText}]"],["REST@@CRUD@@report","REST","CRUD","Report","After your test executions a report will be produced.Note: asserted values are being tracked and highlighted inside the report"],["REST@@CRUD@@spring-boot","REST","CRUD","Spring Boot","WebTau is framework agnostic. However, to make a concrete example, the /customer CRUD endpoint is created by using https://projects.spring.io/spring-boot/ Spring Boot.Three files are required to have a working REST endpoint with CRUD operations.Domain object package com.example.demo.springboot.app.data; import javax.persistence.Entity; import javax.persistence.GeneratedValue; import javax.persistence.Id; @Entity public class Customer { private Long id; private String firstName; private String lastName; @Id @GeneratedValue public Long getId() { return id; } public void setId(Long id) { this.id \u003d id; } public String getFirstName() { return firstName; } public void setFirstName(String firstName) { this.firstName \u003d firstName; } public String getLastName() { return lastName; } public void setLastName(String lastName) { this.lastName \u003d lastName; } } Repository package com.example.demo.springboot.app.data; import io.swagger.annotations.Api; import io.swagger.annotations.ApiOperation; import org.springframework.data.jpa.repository.JpaRepository; import org.springframework.data.rest.core.annotation.RepositoryRestResource; @Api(tags \u003d \"customer\") @RepositoryRestResource(collectionResourceRel \u003d \"customers\", path \u003d \"customers\") public interface CustomerRepository extends JpaRepository\u003cCustomer, Long\u003e { @ApiOperation(\"find all customers ordered by last name\") Iterable\u003cCustomer\u003e findAllByOrderByLastName(); } Entry point package com.example.demo.springboot.app; import org.springframework.boot.SpringApplication; import org.springframework.boot.autoconfigure.SpringBootApplication; import org.springframework.context.annotation.Bean; import org.springframework.context.annotation.Import; import org.springframework.data.jpa.repository.config.EnableJpaRepositories; import springfox.documentation.builders.PathSelectors; import springfox.documentation.builders.RequestHandlerSelectors; import springfox.documentation.spi.DocumentationType; import springfox.documentation.spring.web.plugins.Docket; import springfox.documentation.swagger2.annotations.EnableSwagger2; @SpringBootApplication @EnableJpaRepositories @EnableSwagger2 @Import({springfox.documentation.spring.data.rest.configuration.SpringDataRestConfiguration.class}) public class SpringBootDemoApp { public static void main(String[] args) { SpringApplication.run(SpringBootDemoApp.class, args); } @Bean public Docket api() { return new Docket(DocumentationType.SWAGGER_2) .select() .apis(RequestHandlerSelectors.any()) .paths(PathSelectors.any()) .build(); } }"],["REST@@CRUD-separated@@lazy-resource","REST","CRUD Separated","Lazy Resource","One of the benefits of separating one CRUD scenario into multiple is to be able to run one test at a time. In order to do it we will use createLazyResource . package scenarios.rest.springboot import static com.twosigma.webtau.WebTauGroovyDsl.* class Customer { Number id String url // store url of the created entity } def customerPayload \u003d [firstName: \"FN\", lastName: \"LN\"] def customer \u003d createLazyResource(\"customer\") { // lazy resource to be created on the first access int id \u003d http.post(\"/customers\", customerPayload) { return id } return new Customer(id: id, url: \"/customers/${id}\") } scenario(\"customer create\") { customer.id.should !\u003d null // accessing resource for the first time will trigger POST (in this example) } scenario(\"customer read\") { http.get(customer.url) { // convenient re-use of url defined above body.should \u003d\u003d customerPayload } } scenario(\"customer update\") { def changedLastName \u003d \"NLN\" http.put(customer.url, [*:customerPayload, lastName: changedLastName]) { lastName.should \u003d\u003d changedLastName } http.get(customer.url) { lastName.should \u003d\u003d changedLastName } } scenario(\"customer delete\") { http.delete(customer.url) { statusCode.should \u003d\u003d 204 } http.get(customer.url) { statusCode.should \u003d\u003d 404 } } Note: to run one scenario at a time use sscenario (additional s in front)"],["REST@@CRUD-separated@@report","REST","CRUD Separated","Report","As you can see in the report below, each CRUD operation has its own entry. If you follow this pattern, then you can filter tests by create , update , read , delete to streamline investigation."],["REST@@data-node@@special-values","REST","Data Node","Special Values","Values that you access inside validation block are special values of DataNode type. When you assert them using should statement they act as proxies that record every assertion that you do."],["REST@@data-node@@extracting-values","REST","Data Node","Extracting Values","As you have seen in REST/CRUD CRUD example you can return values back from a validation block.When you return a value from a validation block, it automatically gets converted to its correspondent primitive.Note: asserting that value after returning will not track and associated assertions with the call anymore. Use it only to get values required for consequent test calls."],["REST@@data-node@@properties-on-lists","REST","Data Node","Properties On Lists","If you have a list of objects like complexList above, you can access all its children property value with complexList.k2 ."],["REST@@data-node@@find","REST","Data Node","Find","Special values inside assertion block have convenient methods find to find a single valueand findAll to find all the values matching predicateNote: While values inside a predicate are normal values, the result of find and findAll is still DataNode"],["REST@@data-node@@collect","REST","Data Node","Collect","Use collect to transform a collection of items"],["REST@@data-node@@combine","REST","Data Node","Combine","Methods find and collect can be chained"],["REST@@headers@@standard-header","REST","Headers","Standard Header","Standard headers like Content-Type and Accept are set on your behalf. When payload content is present then values are based on the content type you are sending. When no payload is present, it defaults to application/json ."],["REST@@headers@@common-header","REST","Headers","Common Header","If each http request requires the same header you can specify that header using httpHeaderProvider . Common example is specifying authentication header. import scenarios.rest.headers.auth.Auth url \u003d \"http://localhost:8080\" httpHeaderProvider \u003d Auth.\u0026authHeader Where Auth.\u0026authHeader is implemented as follows: package scenarios.rest.headers.auth import com.twosigma.webtau.console.ConsoleOutputs import com.twosigma.webtau.http.HttpHeader class Auth { static HttpHeader authHeader(String fullUrl, String url, HttpHeader original) { ConsoleOutputs.out(\u0027auth header injection point\u0027) return original.merge([Authorization: \u0027Bearer \u003ctoken\u003e\u0027]) } } This removes implementation details from your tests and makes them less brittle."],["REST@@headers@@explicit-header","REST","Headers","Explicit Header","To explicitly set header pass http.header(values) as an additional parameter.Additionally http.header accepts values as a map."],["REST@@headers@@response-header","REST","Headers","Response Header","To validate values from response header use header object.At the moment only location , contentLocation , contentLength have camelCase shortcuts. All the other header values you need to use [\u0027Header-Name\u0027] syntax."],["REST@@files-upload@@file-system-content","REST","Files Upload","File System Content","In following examples backend expects a file passed as multipart/form-data . File content is expected to be stored in file field. Backend responds with received file name and file description.To POST form data, you need to use the same http.post statement as you saw in previous examples. Second parameter should be http.formData instead of a map payload we used for JSON .Use http.formFile to override file name that is being sent to the backend.Multiple form fields can be specified like in the example below."],["REST@@files-upload@@in-memory-content","REST","Files Upload","In-Memory Content","If your test already has content, you can explicitly pass it as is.Note: no file name is passed and this particular backend generated file name on your behalf.Use http.formFile to provide a file name"],["REST@@PDF@@asserting-text","REST","PDF","Asserting Text","If response contains a pdf file you can assert its content using pdf(body) function.If more than one assertion needs to be made, assign pdf result to a local variable.Note: use pdf assertions for sanity checks like presence of correct client names or account numbers. Leave comprehensive pdf generation test to unit tests."],["REST@@documentation@@scenarios","REST","Documentation","Scenarios","You provide REST endpoints so users can execute various scenarios. You need to test those scenarios and then document them.To automate the process, let\u0027s capture executed scenarios and use them inside your documentation."],["REST@@documentation@@test-artifacts","REST","Documentation","Test Artifacts","To capture artifacts use http.doc.capture : package scenarios.rest import static com.twosigma.webtau.WebTauDsl.http import static com.twosigma.webtau.WebTauGroovyDsl.scenario scenario(\"extracting id after POST to use inside GET request\") { def id \u003d http.post(\"/employee\", [firstName: \u0027FN\u0027, lastName: \u0027LN\u0027]) { return id } http.doc.capture(\u0027employee-post\u0027) http.get(\"/employee/$id\") { firstName.should \u003d\u003d \u0027FN\u0027 lastName.should \u003d\u003d \u0027LN\u0027 } http.doc.capture(\u0027employee-get\u0027) // capture previous HTTP call into \u003cdocDir\u003e/employee-get } An employee-get directory will be created with request and response data files.Directory will also contain a json file with an array containing paths of all the asserted values.By default, the directory will be created in the current working directory. To change it add docPath to your webtau.cfg file. url \u003d \"http://localhost:8180\" docPath \u003d \"doc-artifacts\""],["REST@@documentation@@document-rest-calls","REST","Documentation","Document REST calls","If you have user facing scenario tests, capture them and refer to them inside your documentation. Set your documentation build pipeline like below.Combine REST requests and responses with Open API generated specs for complete documentation."],["REST@@complex-types@@contain","REST","Complex Types","Contain","Use contain matcher to test scenarios like search or list of recently created entries. This way you don\u0027t have to assume an existing state of your backend under test.Given the response, we want to make sure there is an entry with a specified firstName and lastName . package scenarios.rest.springboot import static com.twosigma.webtau.WebTauGroovyDsl.* scenario(\"list Customers and assert that it contains a specified entry\") { http.get(\"/customers/search/findAllByOrderByLastName\") { _embedded.customers.should contain([firstName: \u0027FN1\u0027, lastName: \u0027LN1\u0027]) } }"],["REST@@complex-types@@list-of-objects","REST","Complex Types","List Of Objects","If you want to make sure that all the values in the list are what you need - use TableData . package scenarios.rest.springboot import static com.twosigma.webtau.WebTauGroovyDsl.* scenario(\"list Customers and assert with a Table Data\") { http.post(\"/customers\", [firstName: \"FN1\", lastName: \"LN1\"]) http.post(\"/customers\", [firstName: \"FN2\", lastName: \"LN2\"]) http.post(\"/customers\", [firstName: \"FN3\", lastName: \"LN3\"]) http.get(\"/customers/search/findAllByOrderByLastName\") { _embedded.customers.should \u003d\u003d [\u0027firstName\u0027 | \u0027lastName\u0027] { __________________________ \u0027FN1\u0027 | \u0027LN1\u0027 \u0027FN2\u0027 | \u0027LN2\u0027 \u0027FN3\u0027 | \u0027LN3\u0027 } } http.doc.capture(\u0027list-match\u0027) }"],["REST@@openAPI-spec@@validation","REST","OpenAPI Spec","Validation","Webtau supports validation of responses against an https://www.openapis.org/ OpenAPI specification. This feature can be enabled by specifying the openApiSpecUrl configuration option. This should be the URL to the specification against which to validate. url \u003d \"http://localhost:8080\" openApiSpecUrl \u003d \u0027api-spec.json\u0027"],["REST@@openAPI-spec@@current-limitations","REST","OpenAPI Spec","Current limitations","OpenAPI specification support is still in its early stage. It is fully functional but there are a few limitations to be aware of:webtau currently only supports OpenAPI specification v2specification matching is currently done purely based on the pathany HTTP requests which do not match any operation in the specification will not fail tests but will produce a warning on the console"],["REST@@openAPI-spec@@validations-report","REST","OpenAPI Spec","Validations report","The validation errors are reported in the same manner as assertion errors. They are available in the output from the command line webtau runner: bash \u003e executing HTTP POST http://localhost:8080/customers { \"id\": 1, \"firstName\": \"FN\", \"lastName\": \"LN\", \"_links\": { \"self\": { \"href\": \"http://localhost:8080/customers/1\" }, \"customer\": { \"href\": \"http://localhost:8080/customers/1\" } } } X failed executing HTTP POST http://localhost:8080/customers : API spec validation failure: ERROR - Response status 201 not defined for path \u0027\u0027.: [] [x] failed java.lang.AssertionError: API spec validation failure: ERROR - Response status 201 not defined for path \u0027\u0027.: [] at scenarios.rest.springboot.customerCrud$_run_closure1.doCall(customerCrud.groovy:8) at scenarios.rest.springboot.customerCrud$_run_closure1.doCall(customerCrud.groovy) Total: 1, Passed: 0, Skipped: 0, Failed: 1, Errored: 0 They are also available in the HTML report:"],["REST@@openAPI-spec@@validation-configuration","REST","OpenAPI Spec","Validation Configuration","To ignore additional properties in responses set openApiIgnoreAdditionalProperties to true . As any other config value it can be done via command line, config file or system properties."],["REST@@report@@location","REST","Report","Location","By default report is generated at \u003cworkingdir\u003e/webtau.report.html . To change the location use --reportPath option."],["REST@@report@@summary","REST","Report","Summary","Out of the box report provides high level information like number of failed tests and HTTP Operations coverage."],["REST@@report@@navigation","REST","Report","Navigation","Report is a self contained single page application. Url tracks your navigation through screens, so you can share url with your teammates to narrow down a problem."],["REST@@report@@additional-reports","REST","Report","Additional Reports","To generate custom reports, or upload report data to your server, specify reportGenerator config property. import scenarios.rest.report.Report url \u003d \"http://localhost:8080\" reportGenerator \u003d Report.\u0026generateReport Where Report.\u0026generateReport is implemented as following package scenarios.rest.report import com.twosigma.webtau.console.ConsoleOutputs import com.twosigma.webtau.console.ansi.Color import com.twosigma.webtau.report.ReportTestEntries import static com.twosigma.webtau.WebTauDsl.cfg class Report { static void generateReport(ReportTestEntries entries) { def reportPath \u003d cfg.workingDir.resolve(\u0027report.txt\u0027) ConsoleOutputs.out(\u0027generating report: \u0027, Color.PURPLE, reportPath) reportPath.toFile().text \u003d entries.size() } }"],["REST@@maven@@dependency","REST","Maven","Dependency","You can use maven to add webtau as a dependency to you project (for autocompletion or to use with JUnit like runners). Groovy \u003cdependency\u003e \u003cgroupId\u003ecom.twosigma.webtau\u003c/groupId\u003e \u003cartifactId\u003ewebtau-groovy\u003c/artifactId\u003e \u003cversion\u003e0.30-SNAPSHOT\u003c/version\u003e \u003c/dependency\u003e Java \u003cdependency\u003e \u003cgroupId\u003ecom.twosigma.webtau\u003c/groupId\u003e \u003cartifactId\u003ewebtau\u003c/artifactId\u003e \u003cversion\u003e0.30-SNAPSHOT\u003c/version\u003e \u003c/dependency\u003e"],["REST@@maven@@plugin","REST","Maven","Plugin","Use maven plugin to run pure groovy tests as part of your build. \u003cplugin\u003e \u003cgroupId\u003ecom.twosigma.webtau\u003c/groupId\u003e \u003cartifactId\u003ewebtau-maven-plugin\u003c/artifactId\u003e \u003cversion\u003e0.30-SNAPSHOT\u003c/version\u003e \u003cexecutions\u003e \u003cexecution\u003e \u003cphase\u003etest\u003c/phase\u003e \u003cgoals\u003e \u003cgoal\u003erun\u003c/goal\u003e \u003c/goals\u003e \u003c/execution\u003e \u003c/executions\u003e \u003cconfiguration\u003e \u003cworkingDir\u003e${project.basedir}/src/main/groovy\u003c/workingDir\u003e \u003cenv\u003eintegration\u003c/env\u003e \u003curl\u003ehttp://optional-base-url\u003c/url\u003e \u003ctests\u003e \u003cdirectory\u003e${project.basedir}/src/main/groovy\u003c/directory\u003e \u003cincludes\u003e \u003cinclude\u003escenarios/*.groovy\u003c/include\u003e \u003c/includes\u003e \u003c/tests\u003e \u003c/configuration\u003e \u003c/plugin\u003e Use env to specify configuration/environments environment to use. Alternatively you can use url to override base url."],["REST@@matchers@@response-mapping","REST","Matchers","Response Mapping","Identifiers inside validation closure are automatically mapped to a response body.In case of an array response you need to access values using body ."],["REST@@matchers@@should-and-should-not","REST","Matchers","Should and Should Not","Matchers in webtau are triggered with should and shouldNot keywords. groovy myValue.should contain(10) myValue.shouldNot equal(\"hello\") Some matchers have alternative shortcuts. groovy myValue.should !\u003d 10 Additionally shouldBe and shouldNotBe alias keywords are available to make certain matcher combinations easier to read groovy myValue.shouldBe greaterThan(10) myValue.shouldBe \u003e 10"],["REST@@matchers@@equality","REST","Matchers","Equality","Webtau defines its own set of equality rules to simplify testing."],["REST@@matchers@@greaterlessequal","REST","Matchers","Greater/Less/Equal","Standard operations \u003e , \u003e\u003d , \u003c , \u003c\u003d are supported as shortcuts for greaterThan , greaterThanOrEqual , lessThan , and lessThanOrEqual ."],["REST@@matchers@@contain","REST","Matchers","Contain","Use contain when you cannot rely on order."],["REST@@matchers@@date-and-time","REST","Matchers","Date and Time","You can assert actual string against LocalDate and ZonedDateTime . String will be automatically converted using ISO formatter."],["REST@@matchers@@mixing-matchers","REST","Matchers","Mixing Matchers","You can use matchers in place of expected values to build a more complex expectation."],["REST@@test-execution@@serial-execution","REST","Test Execution","Serial execution","The default mode for running tests is serially; in other words, scenario files are executed one after the other."],["REST@@test-execution@@parallel-execution","REST","Test Execution","Parallel execution","Webtau supports executing tests in parallel. In this mode, scenario files are executed in parallel. Individual scenarios are still executed sequentially.For large test suites, it is therefore advisable to create many small focused scenario files instead of few large files.To enable parallel execution, specify the numberOfThreads configuration property either through the configuration file or as a CLI parameter. This property dictates the maximum number of threads on which to run tests.Note: scenario file execution order is not guaranteed."],["UI@@getting-started@@bare-minimum","UI","Getting Started","Bare Minimum","package scenarios.ui import static com.twosigma.webtau.WebTauGroovyDsl.* scenario(\u0027simple open\u0027) { browser.open(\"/search\") $(\u0027#welcome\u0027).should \u003d\u003d \u0027welcome to super search\u0027 } To run test, navigate to examples dir and webtau scenarios/ui/basic.groovy --url\u003dhttps://my-server"],["UI@@getting-started@@config-file","UI","Getting Started","Config File","Url parameter can be moved to a webtau.cfg file. url \u003d \"http://localhost:8180\" configuration/environments Specify multiple environments to streamline test execution."],["UI@@basic-configuration@@base-url","UI","Basic Configuration","Base URL","Robust tests don\u0027t specify the full URL of an application under test. Instead you only pass a relative URL to functions like open .Define base URL portion either inside a webtau.cfg file url \u003d \"http://localhost:8180\" or pass as a command line argument --url\u003dhttp://..."],["UI@@page-element-and-value@@lazy-element","UI","Page Element And Value","Lazy Element","When you use $(\u0027.css\u0027) you create instance of PageElement . PageElement represent an element that is present or will be present on a web page. It is safe to declare an element before you open a browser or navigate to the page you need to test. package scenarios.ui import static com.twosigma.webtau.WebTauGroovyDsl.* def welcomeMessage \u003d $(\u0027#welcome\u0027) scenario(\u0027simple open\u0027) { browser.open(\"/search\") welcomeMessage.should \u003d\u003d \u0027welcome to super search\u0027 }"],["UI@@page-element-and-value@@lazy-value","UI","Page Element And Value","Lazy Value","Consider a simple search page. Enter value, hit enter, see results.Here is simple test. package scenarios.ui import static com.twosigma.webtau.WebTauGroovyDsl.* scenario(\u0027search by specific query\u0027) { browser.open(\u0027/search\u0027) $(\u0027#search-box\u0027).setValue(\u0027search this\u0027) $(\u0027#search-box\u0027).sendKeys(\"\\n\") $(\u0027#results .result\u0027).count.shouldBe \u003e 1 } In the example $(\u0027#results .result\u0027).count represents the number of elements matching the css selector. Let\u0027s extract it. package scenarios.ui import static com.twosigma.webtau.WebTauGroovyDsl.* def searchBox \u003d $(\u0027#search-box\u0027) def numberOfResults \u003d searchBox.count scenario(\u0027search by specific query\u0027) { browser.open(\u0027/search\u0027) searchBox.setValue(\u0027search this\u0027) searchBox.sendKeys(\"\\n\") numberOfResults.shouldBe \u003e 1 }"],["UI@@page-object@@test-encapsulation","UI","Page Object","Test Encapsulation","Robust tests should not depend on implementation details. UI has plenty of those:UI Elements placementActionsUI test should not depend on any of them. Move elements placement and available actions outside of UI test. Multiple tests can then reuse that information. And more importantly you will have only one place to change if UI changes."],["UI@@page-object@@definition","UI","Page Object","Definition","To define PageObject create a class."],["UI@@page-object@@grouping","UI","Page Object","Grouping","To make it easier to refer PageObjects from different tests combine them in one fileUse static import to have seamless access to all of them"],["UI@@advanced-configuration@@timeouts","UI","Advanced Configuration","Timeouts","Default timeout in milliseconds for waitTo and waitToNot waitTimeout \u003d 25000 --waitTimeout\u003d25000"],["UI@@advanced-configuration@@window-size","UI","Advanced Configuration","Window Size","Browser window size can be set using windowWidth and windowHeight url \u003d \"http://localhost:8180\" windowWidth \u003d 1280 windowHeight \u003d 800"],["UI@@advanced-configuration@@documentation-artifacts","UI","Advanced Configuration","Documentation Artifacts","By default all generated documentation artifacts (e.g. screenshots) are created in the current directory. To override url \u003d \"http://localhost:8180\" docPath \u003d \"screenshots\""],["UI@@finders-and-filters@@finders","UI","Finders And Filters","Finders","Finders in webtau is the initial web element selection that could select one or more elements."],["UI@@finders-and-filters@@by-css","UI","Finders And Filters","By CSS","Use $ to select an element by a given css selector def welcomeMessage \u003d $(\u0027#welcome\u0027) welcomeMessage.should \u003d\u003d \u0027hello\u0027 If more than one element is matched, the first one will be used for actions and assertions. def menu \u003d $(\u0027ul li a\u0027) menu.should \u003d\u003d \u0027book\u0027 While click and sendKeys will always work on a first element only, the matchers can work with a list of things. def menu \u003d $(\u0027ul li a\u0027) menu.should \u003d\u003d [\u0027book\u0027, \u0027orders\u0027, \u0027help\u0027]"],["UI@@finders-and-filters@@filters","UI","Finders And Filters","Filters","You can use filters to narrow down elements selected by finders like css .Filter comes in a way of get method. Parameter is one of the followingElement numberElement textElement regexp def ordersMenu \u003d $(\u0027ul li a\u0027).get(2) ordersMenu.should \u003d\u003d \u0027orders\u0027 def ordersMenu \u003d $(\u0027ul li a\u0027).get(\u0027orders\u0027) ordersMenu.should \u003d\u003d \u0027orders\u0027 def ordersMenu \u003d $(\u0027ul li a\u0027).get(~/ord/) ordersMenu.should \u003d\u003d \u0027orders\u0027"],["UI@@matchers@@text","UI","Matchers","Text","def message \u003d $(\u0027#message\u0027) message.should \u003d\u003d \u0027Select option\u0027 def message \u003d $(\u0027#message\u0027) message.should \u003d\u003d ~/option/ def menu \u003d $(\u0027#menu ul li\u0027) menu.should \u003d\u003d [\u0027Hello\u0027, \u0027Text\u0027, \u0027World\u0027] def menu \u003d $(\u0027#menu ul li\u0027) menu.should \u003d\u003d [\u0027Hello\u0027, ~/T..t/, \u0027World\u0027]"],["UI@@matchers@@numbers","UI","Matchers","Numbers","def total \u003d $(\u0027#total\u0027) total.should \u003d\u003d 300.6 def total \u003d $(\u0027#total\u0027) total.shouldBe \u003e 200 def total \u003d $(\u0027#total\u0027) total.shouldBe \u003e\u003d 300 def split \u003d $(\u0027#split ul li\u0027) split.should \u003d\u003d [100, 28, 172.6] def split \u003d $(\u0027#split ul li\u0027) split.should \u003d\u003d [100, lessThan(100), greaterThanOrEqual(150)]"],["configuration@@cli@@overrides","Configuration","Cli","Overrides","Any config file parameter can be overridden with a command line parameter.For example, given this config file: cfg waitTimeout \u003d 2500 url \u003d http://my-server Values can be overridden as follows: webtau --waitTimeout\u003d25000 --url\u003dhttp://another-server"],["configuration@@environments@@select","Configuration","Environments","Select","cfg waitTimeout \u003d 2500 url \u003d http://my-server environments { dev { url \u003d \"http://localhost:8080\" } } webtau --env\u003ddev"],["configuration@@options@@cli-and-configuration-file-options","Configuration","Options","CLI and configuration file options","name description default value ansiColor enable/disable ANSI colors true chromeBinPath path to chrome binary chromeDriverPath path to chrome driver binary config config file path webtau.cfg docPath path for screenshots and other generated artifacts for documentation ${workingDir} env environment id local headless run headless mode false numberOfThreads number of threads on which to run test files (one file per thread) 1 openApiIgnoreAdditionalProperties ignore additional OpenAPI properties false openApiSpecUrl url of OpenAPI 2 spec against which to validate http calls reportPath report file path ${workingDir}/webtau.report.html url base url for application under test verbosityLevel output verbosity level. 0 - no output; 1 - test names; 2 - first level steps; etc 2147483647 waitTimeout wait timeout in milliseconds 5000 windowHeight browser window height 800 windowWidth browser window width 1000 workingDir logical working dir"],["configuration@@options@@environment-variable-options","Configuration","Options","Environment variable options","environment variable description default value WEBTAU_ANSICOLOR enable/disable ANSI colors true WEBTAU_CHROMEBINPATH path to chrome binary WEBTAU_CHROMEDRIVERPATH path to chrome driver binary WEBTAU_CONFIG config file path webtau.cfg WEBTAU_DOCPATH path for screenshots and other generated artifacts for documentation ${workingDir} WEBTAU_ENV environment id local WEBTAU_HEADLESS run headless mode false WEBTAU_NUMBEROFTHREADS number of threads on which to run test files (one file per thread) 1 WEBTAU_OPENAPIIGNOREADDITIONALPROPERTIES ignore additional OpenAPI properties false WEBTAU_OPENAPISPECURL url of OpenAPI 2 spec against which to validate http calls WEBTAU_REPORTPATH report file path ${workingDir}/webtau.report.html WEBTAU_URL base url for application under test WEBTAU_VERBOSITYLEVEL output verbosity level. 0 - no output; 1 - test names; 2 - first level steps; etc 2147483647 WEBTAU_WAITTIMEOUT wait timeout in milliseconds 5000 WEBTAU_WINDOWHEIGHT browser window height 800 WEBTAU_WINDOWWIDTH browser window width 1000 WEBTAU_WORKINGDIR logical working dir"]]
mdocSearchIdx = lunr(function () {
    this.ref('id')
    this.field('section')
    this.field('pageTitle')
    this.field('pageSection')
    this.field('text')

    this.metadataWhitelist = ['position']

    mdocSearchData.forEach(function (e) {
        this.add({
            id: e[0],
            section: e[1],
            pageTitle: e[2],
            pageSection: e[3],
            text: e[4],
        })
    }, this)
})
