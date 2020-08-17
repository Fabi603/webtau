/*
 * Copyright 2020 webtau maintainers
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.testingisdocumenting.webtau.featuretesting


import org.junit.AfterClass
import org.junit.BeforeClass
import org.junit.Test
import org.testingisdocumenting.webtau.http.testserver.GraphQLResponseHandler

import static org.testingisdocumenting.webtau.featuretesting.WebTauGraphQLFeaturesTestData.AUTH_TOKEN

class WebTauGraphQLFeaturesTest {
    private static WebTauEndToEndTestRunner testRunner
    private static GraphQLResponseHandler handler

    @BeforeClass
    static void init() {
        handler = WebTauGraphQLFeaturesTestData.graphQLResponseHandler()
        testRunner = new WebTauEndToEndTestRunner(handler)

        testRunner.startTestServer()
    }

    @AfterClass
    static void cleanup() {
        testRunner.stopTestServer()
    }

    @Test
    void "simple query and mutation"() {
        runCli("queryAndMutation.groovy", "webtau.cfg", "--url=${testRunner.testServer.uri}")
    }

    @Test
    void "authed graphql"() {
        handler.withAuthEnabled(AUTH_TOKEN) {
            runCli("query.groovy", "webtau-authed-graphql.cfg", "--url=${testRunner.testServer.uri}")
        }
    }

    private static void runCli(String graphQLTestName, String configFileName, String... additionalArgs) {
        testRunner.runCli("scenarios/graphql/$graphQLTestName",
            "scenarios/graphql/$configFileName", additionalArgs)
    }
}
